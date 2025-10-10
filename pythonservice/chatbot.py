import requests
import mysql.connector
import re
import pandas as pd
from transformers import pipeline

# -----------------------------
# CONFIG
# -----------------------------
GROQ_API_KEY = "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"
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '<<mysqlpassword>>',  # Update if needed
    'database': 'device_details'    
}

# Load the Q&A model for fallback chatbot functionality
qa_model = pipeline("text2text-generation", model="google/flan-t5-large")


# -----------------------------
# HELPER FUNCTIONS
# -----------------------------
def groq_chat_completion(messages):
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "meta-llama/llama-4-scout-17b-16e-instruct",
        "messages": messages,
        "max_tokens": 500,
        "temperature": 0.0
    }
    response = requests.post(GROQ_API_URL, json=data, headers=headers)
    response.raise_for_status()
    return response.json()


def execute_sql(sql_query):
    db = mysql.connector.connect(**DB_CONFIG)
    cursor = db.cursor(dictionary=True)
    try:
        print(f"DEBUG: Executing SQL: {sql_query}")
        cursor.execute(sql_query)
        results = cursor.fetchall()
        print(f" DEBUG: Query returned {len(results)} rows")

        # Debug: Show first few results for COUNT queries
        if "COUNT(*)" in sql_query.upper() and results:
            print(f"DEBUG: Count result: {results[0]}")

        return results
    except Exception as e:
        print(f"DEBUG: SQL Error: {str(e)}")
        return {"error": str(e)}
    finally:
        cursor.close()
        db.close()


def format_results(results):
    if isinstance(results, dict) and "error" in results:
        return f"SQL Error: {results['error']}"
    if not results:
        return "No matching records found."
    lines = []
    for row in results:
        lines.append(", ".join(f"{k}: {v}" for k, v in row.items()))
    return "\n".join(lines)


def clean_sql(sql):
    sql = re.sub(r"```sql", "", sql, flags=re.IGNORECASE)
    sql = re.sub(r"```", "", sql)
    return sql.strip()


# -----------------------------
# UPDATED SYSTEM PROMPT WITH CORRECT STATUS DEFINITIONS
# -----------------------------
system_prompt = """
You are an assistant that translates natural language questions into SQL queries
for a MySQL database called `device_details`.

If user asks about portal features, workflows, how to do something, diagrams, or app functionality, respond with:
"For questions about portal features and how to use the system, please use the 'About Portal' tab. I specialize in data queries and analysis."

If user says random words not related to device data analysis, give a polite reply asking the user to ask for a device data query or use the About Portal tab.

DATABASE SCHEMA:

1. owners
   - owner_id (VARCHAR, PK) → unique ID of the owner/user (e.g., 'OWN123456')
   - contact_info (VARCHAR) → email or phone number
   - name (VARCHAR) → owner's full name
   Notes:
     * Represents all users in the system
     * An owner may or may not currently have devices assigned
     * Names should be matched case-insensitively

2. device
   - device_id (VARCHAR, PK) → unique device identifier (e.g., 'TEL125472')
   - created_on (DATE) → when device was added to system
   - is_soft_deleted (TINYINT) → 0 = active in system, 1 = soft deleted
   - last_update (DATE) → last modification timestamp
   - manufacturer (VARCHAR) → device manufacturer (Apple, Cisco, Samsung, Garmin, etc.)
   - name (VARCHAR) → device display name/label
   - owner_id (VARCHAR, FK → owners.owner_id) → current owner (can be NULL for unassigned)
   - purchase_date (DATE) → original purchase date
   - status (VARCHAR) → current operational status ('Active', 'Inactive', 'Retired', mixed case)
   - type (VARCHAR) → device category ('Laptop', 'Smartphone', 'Tablet', 'Router', 'Smartwatch')
   - deleted_on (DATE) → soft deletion date (nullable)
   Notes:
     * Contains all registered devices in the system
     * Devices may be unassigned (owner_id = NULL)
     * Status values are mixed case - use LOWER() for consistency

3. status_tracker (dsh)
   - id (INT, PK) → unique history record ID
   - device_id (VARCHAR, FK → device.device_id) → reference to device
   - status (VARCHAR) → status value at that time ('Active', 'Inactive', 'Retired', mixed case)
   - timestamp (TIME) → time when status changed (format: HH:MM:SS)
   Notes:
     * Tracks all historical status changes for devices
     * Multiple entries per device show status progression over time
     * Use for tracking device status patterns and history

CRITICAL DEVICE STATUS DEFINITIONS:
- Active devices = LOWER(status) = 'active' AND is_soft_deleted = 0
- Retired devices = LOWER(status) = 'retired' AND is_soft_deleted = 0
- Inactive devices = LOWER(status) = 'inactive' AND is_soft_deleted = 1

CRITICAL TERMINOLOGY DEFINITIONS:
- "Total devices" OR "registered devices" OR "how many devices" = Active devices + Inactive devices (excludes retired and soft-deleted devices)
- "Active devices" = devices with active status and not soft-deleted
- "Inactive devices" = devices with inactive status and soft-deleted
- "Retired devices" = devices with retired status and not soft-deleted
- "All devices" = everything in device table (includes all statuses and soft-deleted)

QUERY GENERATION RULES:

BASIC REQUIREMENTS:
- Output ONLY valid MySQL syntax (no markdown, explanations, or comments)
- Use only existing column names - never invent new fields
- Use table aliases ONLY when joining multiple tables (e.g., JOINs)
- For single table queries, do NOT use table aliases
- When selecting all columns with aliases, use 'alias.*'

DATA FILTERING:
- Active devices = LOWER(status) = 'active' AND is_soft_deleted = 0
- Retired devices = LOWER(status) = 'retired' AND is_soft_deleted = 0
- Inactive devices = LOWER(status) = 'inactive' AND is_soft_deleted = 1
- Total/Registered devices = (LOWER(status) = 'active' AND is_soft_deleted = 0) OR (LOWER(status) = 'inactive' AND is_soft_deleted = 1)
- Always use LOWER() for case-insensitive matching (names, types, manufacturers, status)
- When filtering by device IDs (like 'TEL125472'), use exact string matching on device_id column

JOIN REQUIREMENTS:
- Use INNER JOIN when relationships must exist (device with owner)
- Use LEFT JOIN to find missing relationships (owners without devices)
- Always join on proper foreign key relationships (device.owner_id = owners.owner_id)

AGGREGATION PATTERNS:
- For counting: SELECT COUNT(*) FROM table WHERE conditions
- For grouping: GROUP BY manufacturer, type, owner, etc.
- For top results: ORDER BY COUNT(*) DESC LIMIT n
- For device history: JOIN with status_tracker and return status, timestamp

COMMON QUERY PATTERNS:

Device Queries:
- Total/Registered devices: SELECT COUNT(*) FROM device WHERE (LOWER(status) = 'active' AND is_soft_deleted = 0) OR (LOWER(status) = 'inactive' AND is_soft_deleted = 1);
- Active devices: SELECT COUNT(*) FROM device WHERE LOWER(status) = 'active' AND is_soft_deleted = 0;
- Inactive devices: SELECT COUNT(*) FROM device WHERE LOWER(status) = 'inactive' AND is_soft_deleted = 1;
- Retired devices: SELECT COUNT(*) FROM device WHERE LOWER(status) = 'retired' AND is_soft_deleted = 0;
- All devices: SELECT COUNT(*) FROM device;
- By owner: JOIN with owners table on owner_id
- By type/manufacturer: Use LOWER() for comparison and apply appropriate status filters

Owner Queries:
- All owners: SELECT * FROM owners;
- With devices: JOIN with device table
- Without devices: LEFT JOIN and check for NULL device_id

History Queries:
- Device status history: SELECT status, timestamp FROM status_tracker WHERE device_id = 'ID';
- Recent changes: ORDER BY timestamp DESC

EXAMPLES:

Q: "How many devices?" OR "How many registered devices?" OR "Total devices?"
SQL: SELECT COUNT(*) FROM device WHERE (LOWER(status) = 'active' AND is_soft_deleted = 0) OR (LOWER(status) = 'inactive' AND is_soft_deleted = 1);

Q: "How many devices are currently active?"
SQL: SELECT COUNT(*) FROM device WHERE LOWER(status) = 'active' AND is_soft_deleted = 0;

Q: "How many devices are inactive?"
SQL: SELECT COUNT(*) FROM device WHERE LOWER(status) = 'inactive' AND is_soft_deleted = 1;

Q: "How many devices are retired?"
SQL: SELECT COUNT(*) FROM device WHERE LOWER(status) = 'retired' AND is_soft_deleted = 0;

Q: "How many Apple devices?"
SQL: SELECT COUNT(*) FROM device WHERE LOWER(manufacturer) = 'apple' AND ((LOWER(status) = 'active' AND is_soft_deleted = 0) OR (LOWER(status) = 'inactive' AND is_soft_deleted = 1));

Q: "How many laptops?"
SQL: SELECT COUNT(*) FROM device WHERE LOWER(type) = 'laptop' AND ((LOWER(status) = 'active' AND is_soft_deleted = 0) OR (LOWER(status) = 'inactive' AND is_soft_deleted = 1));

Q: "How many active Apple laptops?"
SQL: SELECT COUNT(*) FROM device WHERE LOWER(manufacturer) = 'apple' AND LOWER(type) = 'laptop' AND LOWER(status) = 'active' AND is_soft_deleted = 0;

Q: "List all devices owned by Alice."
SQL: SELECT d.* FROM device d JOIN owners o ON d.owner_id = o.owner_id WHERE LOWER(o.name) = 'alice' AND ((LOWER(d.status) = 'active' AND d.is_soft_deleted = 0) OR (LOWER(d.status) = 'inactive' AND d.is_soft_deleted = 1));

Q: "Show me the device status history for device TEL125472."
SQL: SELECT status, timestamp FROM status_tracker WHERE device_id = 'TEL125472' ORDER BY timestamp;

Q: "Which owners don't have any devices assigned?"
SQL: SELECT o.* FROM owners o LEFT JOIN device d ON o.owner_id = d.owner_id AND ((LOWER(d.status) = 'active' AND d.is_soft_deleted = 0) OR (LOWER(d.status) = 'inactive' AND d.is_soft_deleted = 1)) WHERE d.device_id IS NULL;

Q: "What are the top 3 manufacturers by device count?"
SQL: SELECT manufacturer, COUNT(*) as device_count FROM device WHERE (LOWER(status) = 'active' AND is_soft_deleted = 0) OR (LOWER(status) = 'inactive' AND is_soft_deleted = 1) GROUP BY manufacturer ORDER BY COUNT(*) DESC LIMIT 3;

Q: "Find unassigned devices."
SQL: SELECT * FROM device WHERE owner_id IS NULL AND ((LOWER(status) = 'active' AND is_soft_deleted = 0) OR (LOWER(status) = 'inactive' AND is_soft_deleted = 1));

Q: "Show all devices including retired and deleted ones."
SQL: SELECT * FROM device;

IMPORTANT NOTES:
- Context will be provided separately - generate SQL based only on the explicit question provided
- Mixed case in status values ('Active', 'active', 'Retired') - always use LOWER() for consistency
- Device IDs follow pattern 'TELnnnnnn' - use exact string matching
- Timestamps in history are TIME format (HH:MM:SS)
- NULL values are possible for owner_id, deleted_on fields
- DEFAULT: Total/registered devices means active + inactive devices only (excludes retired and other soft-deleted devices)
- Only use broad "SELECT * FROM device" when explicitly asked for "all devices" or "including retired/deleted"
"""


# -----------------------------
# FIXED CONTEXT MANAGER - NO MORE ACCUMULATION
# -----------------------------
class ContextManager:
    def __init__(self):
        self.context = {}
        self.last_question = ""

    def extract_context(self, question):
        """Extract context elements from the current question."""
        q = question.lower()
        extracted = {}

        # Device type
        device_types = ["tablet", "laptop", "smartphone", "router", "smartwatch"]
        for device_type in device_types:
            if device_type in q:
                extracted["type"] = device_type

        # Only extract status if it's in a declarative context (not in a question about status)
        # Don't extract status from questions like "how many active?" or "how many inactive?"
        if not any(phrase in q for phrase in ["how many", "count", "show", "list", "find"]):
            if "inactive" in q:
                extracted["status"] = "inactive"
            elif "active" in q:
                extracted["status"] = "active"
            elif "retired" in q:
                extracted["status"] = "retired"

        # Owner
        owner_match = re.search(r"owned by (\w+)", q)
        if owner_match:
            extracted["owner"] = owner_match.group(1).lower()

        # Manufacturer
        manufacturers = ["apple", "cisco", "samsung", "garmin", "dell", "hp"]
        for manufacturer in manufacturers:
            if manufacturer in q:
                extracted["manufacturer"] = manufacturer

        return extracted

    def is_vague_question(self, question):
        """Check if question is vague and might need context."""
        q = question.lower().strip()

        vague_patterns = [
            r"^how many (are )?(active|inactive|retired)\??$",
            r"^how many\??$",
            r"^list (them|those)\??$",
            r"^show me (them|those)\??$",
            r"^which (ones|manufacturers)\??$",
            r"^(which|what) are (active|inactive|retired)\??$",
            r"^show (active|inactive|retired)( ones)?\??$",
            r"^list (active|inactive|retired)( devices)?\??$",
            r"^how many (active|inactive|retired)\??$",
            r"^count (active|inactive|retired)\??$",
            r"^show (active|inactive|retired)\??$",
            r"^find (active|inactive|retired)\??$",
            r"^get (active|inactive|retired)\??$"
        ]

        for pattern in vague_patterns:
            if re.match(pattern, q):
                return True

        return False

    def suggest_context_options(self, question):
        """Generate context suggestions for ambiguous questions."""
        options = []
        base_question = question.lower().strip()

        # Option 1: Use existing context (only if context exists)
        if self.context:
            context_desc = []
            if "type" in self.context:
                context_desc.append(f"{self.context['type']}s")
            if "manufacturer" in self.context:
                context_desc.append(f"from {self.context['manufacturer']}")
            if "owner" in self.context:
                context_desc.append(f"owned by {self.context['owner']}")

            if context_desc:
                context_str = " ".join(context_desc)
                options.append(f"Apply previous context: {base_question} ({context_str})")

        # Option 2: Global query (always available)
        options.append(f"Global query: {base_question} (all devices)")

        return options

    def update_context(self, extracted_context):
        """Replace context completely instead of accumulating - NO MORE CONTEXT ACCUMULATION"""
        # Clear existing context completely and set new context
        self.context = extracted_context.copy()
        print(f"DEBUG: Context completely replaced with: {self.context}")

    def clear_context(self):
        """Clear all stored context."""
        self.context = {}

    def get_context_string(self):
        """Get a string representation of current context for SQL generation."""
        if not self.context:
            return ""

        parts = []
        if "type" in self.context:
            parts.append(f"type: {self.context['type']}")
        if "status" in self.context:
            parts.append(f"status: {self.context['status']}")
        if "owner" in self.context:
            parts.append(f"owned by {self.context['owner']}")
        if "manufacturer" in self.context:
            parts.append(f"manufacturer: {self.context['manufacturer']}")

        return " AND ".join(parts) if parts else ""


def generate_contextual_question(base_question, context_str):
    """Combine base question with context for SQL generation."""
    if not context_str:
        return base_question

    return f"{base_question} with {context_str}"


# -----------------------------
# SQL GENERATION WITH FIXED CONTEXT HANDLING
# -----------------------------
conversation = [{"role": "system", "content": system_prompt}]
context_manager = ContextManager()


def generate_sql_with_frontend_context(question, user_choice=None):
    """Generate SQL with frontend context handling - FIXED to not accumulate context."""
    print(f"DEBUG: Current context before processing: {context_manager.context}")

    # Extract any explicit context from current question
    extracted_context = context_manager.extract_context(question)
    print(f"DEBUG: Extracted context: {extracted_context}")

    # Check if question is vague
    is_vague = context_manager.is_vague_question(question)
    has_context = bool(context_manager.context)

    print(f"DEBUG: Is vague: {is_vague}, Has context: {has_context}")

    # Handle user choice for context suggestions
    if user_choice:
        if user_choice == "clear" or "Global query" in user_choice:
            context_manager.clear_context()
            final_question = question
            print("Context cleared. Processing as global query.")
        elif "Apply previous context" in user_choice or "Combined context" in user_choice:
            # Use existing context
            context_str = context_manager.get_context_string()
            final_question = generate_contextual_question(question, context_str)
            print(f"Using context: {final_question}")
        else:
            final_question = question
    elif is_vague and has_context:
        # Default behavior for vague questions with context - don't auto-apply, let frontend handle it
        final_question = question
        print("Vague question with context - will be handled by frontend suggestions")
    else:
        # Question is explicit or no context exists
        final_question = question
        if extracted_context:
            print(f"Detected explicit context: {extracted_context}")

    # FIXED: Replace context completely instead of accumulating
    if extracted_context:
        context_manager.update_context(extracted_context)

    print(f"DEBUG: Final context after processing: {context_manager.context}")
    print(f"DEBUG: Final question: '{final_question}'")

    # Create a fresh conversation for each query to avoid history contamination
    fresh_conversation = [{"role": "system", "content": system_prompt}]
    fresh_conversation.append({"role": "user", "content": final_question})

    response = groq_chat_completion(fresh_conversation)

    sql = response["choices"][0]["message"]["content"].strip()
    sql = clean_sql(sql)

    # Store this question for future reference
    context_manager.last_question = question

    return sql


def generate_sql(question):
    """Wrapper function for backward compatibility."""
    return generate_sql_with_frontend_context(question)


# -----------------------------
# CHART-SPECIFIC SUMMARIES WITH CORRECTED STATUS DEFINITIONS
# -----------------------------
def generate_summaries(device_df, status_df):
    summaries = {}

    # Chart 1: Device Type Distribution
    type_counts = device_df["type"].value_counts()
    type_summary = []
    type_summary.append("Device type distribution shows diverse range of devices")
    for device_type, count in type_counts.items():
        type_summary.append(f"{count} {device_type.lower()}s in the system")
    summaries["chart1_device_type_distribution"] = type_summary

    # Chart 2: Manufacturer vs Device Type
    manu_types = device_df.groupby(["manufacturer", "type"]).size().reset_index(name="Count")
    manu_summary = []
    manu_summary.append("Manufacturer distribution across device categories:")
    for manu in manu_types["manufacturer"].unique():
        manu_df = manu_types[manu_types["manufacturer"] == manu]
        total = manu_df["Count"].sum()
        items = [f"{row['Count']} {row['type'].lower()}" for _, row in manu_df.iterrows()]
        manu_summary.append(f"{manu}: {total} total devices ({', '.join(items)})")
    summaries["chart2_manufacturer_vs_type"] = manu_summary

    # Chart 3: Assignment Metrics
    device_df["assigned"] = device_df["owner_id"].notna()
    assignment_summary = []
    assignment_summary.append("Device assignment status by type:")
    for dev_type, group in device_df.groupby("type"):
        assigned = group["assigned"].sum()
        unassigned = len(group) - assigned
        assignment_summary.append(f"{dev_type}: {assigned} assigned, {unassigned} unassigned")
    summaries["chart3_assignment_metrics"] = assignment_summary

    # Chart 4: Procurement Trends
    device_df["purchase_year"] = pd.to_datetime(device_df["purchase_date"], errors="coerce").dt.year
    yearly = device_df.groupby(["purchase_year", "manufacturer"]).size().reset_index(name="Count")
    trend_summary = []
    trend_summary.append("Device procurement trends over years:")
    for year in sorted(yearly["purchase_year"].dropna().unique()):
        ydf = yearly[yearly["purchase_year"] == year]
        companies = ydf["manufacturer"].tolist()
        trend_summary.append(f"{int(year)}: {', '.join(companies)} procured devices")
    summaries["chart4_procurement_trends"] = trend_summary

    return summaries


# -----------------------------
# ENHANCED QUESTION HANDLER FOR FRONTEND
# -----------------------------
def format_sql_results_as_table(results):
    """Convert SQL results to HTML table format for large datasets."""
    if not results or len(results) <= 2:
        return None

    # Limit to first 20 rows as requested
    limited_results = results[:20]

    # Get column headers
    headers = list(limited_results[0].keys())

    # Start building HTML table
    table_html = "<table style='border-collapse: collapse; width: 100%; font-size: 12px;'>"

    # Add header row
    table_html += "<tr style='background-color: #f2f2f2;'>"
    for header in headers:
        table_html += f"<th style='border: 1px solid #ddd; padding: 8px; text-align: left;'>{header}</th>"
    table_html += "</tr>"

    # Add data rows
    for i, row in enumerate(limited_results):
        table_html += f"<tr style='{'background-color: #f9f9f9;' if i % 2 == 1 else ''}'>"
        for header in headers:
            value = row.get(header, '')
            table_html += f"<td style='border: 1px solid #ddd; padding: 8px;'>{value}</td>"
        table_html += "</tr>"

    table_html += "</table>"

    return table_html


def ask_question(question: str, history: list, summaries: dict,
                 device_df: pd.DataFrame = None, owner_df: pd.DataFrame = None, status_df: pd.DataFrame = None):
    """
    Enhanced question handler that routes between SQL and chatbot based on question type.
    This function integrates both SQL generation and fallback chatbot functionality.
    """

    # Handle greetings locally
    greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening']
    question_lower = question.lower().strip()
    if any(greeting == question_lower or question_lower.startswith(greeting + ' ') for greeting in greetings):
        return {
            "type": "text",
            "content": "Hello! I'm Bob, your SQL assistant. I can help you analyze device data, owner information, and status tracking. What would you like to know?"
        }

    # First check for definition/conceptual questions (redirect to About Portal)
    conceptual_patterns = [
        r"what is (a|an)?\s*active device",
        r"what is (a|an)?\s*inactive device",
        r"what is (a|an)?\s*retired device",
        r"what is (a|an)?\s*device",
        r"what is (a|an)?\s*tablet",
        r"what is (a|an)?\s*laptop",
        r"what is (a|an)?\s*smartphone",
        r"what are active devices",
        r"what are inactive devices",
        r"what are retired devices",
        r"what are devices",
        r"what are tablets",
        r"what are laptops",
        r"what are smartphones",
        r"define active device",
        r"define inactive device",
        r"define retired device",
        r"explain active device",
        r"explain inactive device",
        r"explain retired device"
    ]

    # Check for definition keywords
    definition_keywords = ["what is", "what are", "define", "definition", "explain", "meaning of"]
    has_definition_keyword = any(keyword in question_lower for keyword in definition_keywords)

    # Check if it's a conceptual question - be very specific
    is_conceptual = any(re.search(pattern, question_lower) for pattern in conceptual_patterns)

    print(f"DEBUG: Question: '{question_lower}'")
    print(f"DEBUG: Has definition keyword: {has_definition_keyword}")
    print(f"DEBUG: Is conceptual: {is_conceptual}")

    # Portal/workflow questions
    portal_keywords = [
        "portal", "workflow", "how to", "process", "diagram", "flowchart",
        "feature", "interface", "tutorial", "guide", "manual", "app working",
        "system architecture", "how does", "how do I", "steps to"
    ]
    is_portal_question = any(keyword in question_lower for keyword in portal_keywords)

    # If it's a definition or conceptual question, redirect to About Portal
    if is_conceptual or is_portal_question:
        print(f"DEBUG: Redirecting to About Portal")
        return {
            "type": "text",
            "content": "For questions about portal features, workflows, diagrams, and how to use the system, please use the 'About Portal' tab. I specialize in device data queries and analysis."
        }

    # Check if this is a data query (count, list, show specific records)
    data_query_keywords = [
        "sql", "count", "show", "find", "how many", "list", "select", "where",
        "manufacturer", "apple", "cisco", "samsung", "garmin", "dell", "hp"
    ]

    # Data query patterns - looking for specific data operations
    data_patterns = [
        r"how many (devices|tablets|laptops|smartphones)",
        r"list (all )?(devices|tablets|laptops|smartphones)",
        r"show (me )?(all )?(devices|tablets|laptops|smartphones)",
        r"find (devices|tablets|laptops|smartphones)",
        r"count (of )?(devices|tablets|laptops|smartphones)",
        r"(devices|tablets|laptops|smartphones) (owned by|from|with)",
        r"(active|inactive|retired) (devices|tablets|laptops|smartphones) (owned|from|with)"
    ]

    is_data_query = (any(keyword in question_lower for keyword in data_query_keywords) or
                     any(re.search(pattern, question_lower) for pattern in data_patterns))

    if is_data_query and not is_conceptual and not has_definition_keyword:
        try:
            # Use SQL generation for database queries
            print(f"Routing to SQL: {question}")
            sql_query = generate_sql_with_frontend_context(question)
            results = execute_sql(sql_query)

            # Format SQL results in a user-friendly way
            if isinstance(results, dict) and "error" in results:
                return {"type": "text", "content": f"I encountered an error with your query: {results['error']}"}
            elif not results:
                return {"type": "text", "content": "I couldn't find any matching records for your query."}
            else:
                # Create a nicely formatted response
                if len(results) == 1 and len(results[0]) == 1:
                    # Single value result (like COUNT)
                    key, value = next(iter(results[0].items()))
                    return {"type": "text", "content": f"The answer is: {value}"}
                elif len(results) <= 2:
                    # Small result set, show all as text
                    formatted = []
                    for i, row in enumerate(results, 1):
                        row_str = ", ".join(f"{k}: {v}" for k, v in row.items())
                        formatted.append(f"{i}. {row_str}")
                    return {"type": "text", "content": "Here are the results:\n" + "\n".join(formatted)}
                else:
                    # Large result set, return as table (first 20 rows)
                    table_html = format_sql_results_as_table(results)
                    return {
                        "type": "table",
                        "content": table_html,
                        "summary": f"Found {len(results)} results - showing first 20 rows"
                    }

        except Exception as e:
            print(f"SQL Error: {e}")
            # Fallback to chatbot if SQL fails
            pass

    # Use chatbot for non-SQL queries or as fallback
    print(f"Routing to Chatbot: {question}")

    # For non-data queries, redirect to About Portal tab
    return {
        "type": "text",
        "content": "For general questions not related to device data analysis, please use the 'About Portal' tab. I specialize in device data queries and analysis - you can ask me about device counts, owner information, status tracking, and similar data-related questions."
    }


# -----------------------------
# CONTEXT MANAGEMENT FOR FRONTEND
# -----------------------------
def get_context_suggestions(question):
    """Get context suggestions for ambiguous questions (for frontend use)."""
    # Check if this is a vague question that could benefit from context
    if context_manager.is_vague_question(question):
        # Always show suggestions for vague questions if we have context
        if context_manager.context:
            return context_manager.suggest_context_options(question)
        # Even without existing context, some questions are inherently ambiguous
        elif any(word in question.lower() for word in ["active", "inactive", "how many"]):
            base_question = question.lower().strip()
            return [
                f"Global query: {base_question} (all devices)",
                f"Specific query: {base_question} (please be more specific about device type, owner, or manufacturer)"
            ]
    return []


def clear_context():
    """Clear the current context."""
    context_manager.clear_context()


def get_current_context():
    """Get the current context state."""
    return context_manager.context.copy()


def set_context(new_context):
    """Set context from frontend."""
    context_manager.context = new_context.copy()