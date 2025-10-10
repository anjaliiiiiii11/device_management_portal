from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
import pandas as pd
import os
from datetime import datetime
import traceback
import logging

import plotly.express as px

# Import from separate chatbot modules
from chatbot import (
    generate_summaries, ask_question,
    get_context_suggestions, clear_context,
    get_current_context, set_context
)
from doc_chatbot import handle_document_question

app = Flask(__name__)
CORS(app)
logging.basicConfig(
    filename="dashboard.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

BASE_DIR = r"<<BASE_DIR>>\capstone5\deviceservice\shared"

def load_csvs():
    try:
        device_df = pd.read_csv(os.path.join(BASE_DIR, "device.csv"))
        owner_df = pd.read_csv(os.path.join(BASE_DIR, "owner.csv"))
        status_df = pd.read_csv(os.path.join(BASE_DIR, "status_tracker.csv"))

        # Rename columns in device_df
        device_df.rename(columns={
            "Type": "type",
            "Manufacturer": "manufacturer",
            "Device ID": "device_id",
            "Owner ID": "owner_id",
            "Status": "status",
            "Purchase Date": "purchase_date"
        }, inplace=True)

        # Add 'is_soft_deleted' column based on status
        if "status" in device_df.columns:
            status_lower = device_df["status"].str.lower()
            device_df["is_soft_deleted"] = status_lower.apply(
                lambda s: 0 if s in ["active", "retired"] else 1
            )

        # Rename columns in status_df
        status_df.rename(columns={
            "Device ID": "device_id",
            "Timestamp": "timestamp",
            "Status": "status"
        }, inplace=True)

        # Rename columns in owner_df
        owner_df.rename(columns={
            "Owner ID": "owner_id",
            "Contact Info": "contact_info",
            "Name": "name"
        }, inplace=True)

        return device_df, owner_df, status_df
    except Exception as e:
        logging.error("CSV load failed: %s", traceback.format_exc())
        raise e

def calculate_metrics(device_df, owner_df):
    """Calculate dashboard metrics with corrected active/inactive/retired definitions"""
    total_devices = len(device_df)

    # Corrected definitions:
    # Active: status = 'active' AND is_soft_deleted = 0
    # Retired: status = 'retired' AND is_soft_deleted = 0
    # Inactive: status = 'inactive' OR is_soft_deleted = 1
    total_active = len(device_df[
                           (device_df["status"].str.lower() == "active") &
                           (device_df["is_soft_deleted"] == 0)
                           ])
    total_retired = len(device_df[
                            (device_df["status"].str.lower() == "retired") &
                            (device_df["is_soft_deleted"] == 0)
                            ])
    total_inactive = len(device_df[
                             (device_df["status"].str.lower() == "inactive") |
                             (device_df["is_soft_deleted"] == 1)
                             ])
    total_users = len(owner_df)

    return {
        "total_devices": total_devices,
        "total_active": total_active,
        "total_inactive": total_inactive,
        "total_retired": total_retired,
        "total_users": total_users
    }


def save_chart(fig, folder_path, base_name):
    """Save chart files only in the timestamped folder"""
    html_file = f"{base_name}.html"
    png_file = f"{base_name}.png"

    # Only save in the timestamped folder
    fig.write_html(os.path.join(folder_path, html_file))
    fig.write_image(os.path.join(folder_path, png_file), scale=2)

    return {"html": html_file, "png": png_file}


blue_orange_palette = ["#4472C4", "#5B9BD5", "#A9D0F5", "#ED7D31", "#F4B183", "#F8CBAD"]
assignment_palette = {
    "Assigned": "#4472C4",
    "Unassigned": "#ED7D31"
}


def generate_charts_and_summaries(device_df, status_df, chart_folder_path):
    """Generate charts only in the timestamped folder"""
    chart_files = {}
    summaries = {}

    # Preprocessing
    for col in ["created_on", "purchase_date", "last_update", "deleted_on"]:
        if col in device_df.columns:
            device_df[col] = pd.to_datetime(device_df[col], errors="coerce")

    device_df["age_days"] = (datetime.now() - device_df["purchase_date"]).dt.days

    # Chart 1: Device Type Distribution
    try:
        type_counts = device_df["type"].value_counts().reset_index()
        type_counts.columns = ["Device Type", "Count"]
        fig1 = px.pie(type_counts, names="Device Type", values="Count", title="Device Type Distribution",
                      color_discrete_sequence=blue_orange_palette)
        fig1.update_traces(textinfo="label+percent", hovertemplate="%{label}: %{value}")
        chart_files["chart1_device_type_distribution"] = save_chart(fig1, chart_folder_path,
                                                                    "01_device_type_distribution")
    except Exception:
        logging.error("Chart 1 failed:\n%s", traceback.format_exc())

    # Chart 2: Manufacturer vs Device Type
    try:
        manu_type = device_df.groupby(["manufacturer", "type"]).size().reset_index(name="Count")
        fig2 = px.bar(manu_type, x="manufacturer", y="Count", color="type", barmode="stack",
                      title="Manufacturer vs Device Type",
                      color_discrete_sequence=blue_orange_palette,
                      hover_data={"manufacturer": True, "type": True, "Count": True})
        chart_files["chart2_manufacturer_vs_type"] = save_chart(fig2, chart_folder_path, "02_manufacturer_vs_type")
    except Exception:
        logging.error("Chart 2 failed:\n%s", traceback.format_exc())

    # Chart 3: Assignment Metrics
    try:
        device_df["assigned"] = device_df["owner_id"].notna()
        device_df["assigned_label"] = device_df["assigned"].map({True: "Assigned", False: "Unassigned"})
        assignment_counts = device_df.groupby(["type", "assigned_label"]).size().reset_index(name="Count")
        fig3 = px.bar(assignment_counts, x="type", y="Count", color="assigned_label",
                      barmode="stack", title="Device Assignment Metrics",
                      color_discrete_map=assignment_palette,
                      hover_data={"type": True, "assigned_label": True, "Count": True})
        chart_files["chart3_assignment_metrics"] = save_chart(fig3, chart_folder_path, "03_device_assignment_metrics")
    except Exception:
        logging.error("Chart 3 failed:\n%s", traceback.format_exc())

    # Chart 4: Procurement Trends
    try:
        device_df["purchase_year"] = device_df["purchase_date"].dt.year
        procurement = device_df.groupby(["purchase_year", "manufacturer"]).size().reset_index(name="Count")
        fig4 = px.bar(procurement, x="purchase_year", y="Count", color="manufacturer",
                      barmode="stack", title="Device Procurement Trends",
                      color_discrete_sequence=blue_orange_palette,
                      hover_data={"purchase_year": True, "manufacturer": True, "Count": True})
        chart_files["chart4_procurement_trends"] = save_chart(fig4, chart_folder_path, "04_device_procurement_trends")
    except Exception:
        logging.error("Chart 4 failed:\n%s", traceback.format_exc())

    # Generate summaries using the updated device_df
    summaries = generate_summaries(device_df, status_df)
    return chart_files, summaries


def determine_chatbot_type(question):
    """Determine which chatbot should handle the question"""
    question_lower = question.lower().strip()

    # Database/SQL keywords
    sql_keywords = [
        "device", "owner", "sql", "list", "count", "show", "find", "how many",
        "what", "which", "select", "where", "manufacturer", "type", "status",
        "tablet", "laptop", "smartphone", "router", "smartwatch", "active", "inactive",
        "apple", "cisco", "samsung", "garmin", "dell", "hp", "database", "query"
    ]

    # Document/system keywords
    doc_keywords = [
        "portal", "system", "architecture", "workflow", "process", "diagram",
        "image", "picture", "visual", "documentation", "manual", "guide",
        "how to", "tutorial", "feature", "application", "interface"
    ]

    # Image request keywords
    image_keywords = [
        'image', 'picture', 'diagram', 'chart', 'figure', 'visual',
        'show me', 'display', 'view', 'see', 'look at'
    ]

    has_sql_keywords = any(keyword in question_lower for keyword in sql_keywords)
    has_doc_keywords = any(keyword in question_lower for keyword in doc_keywords)
    has_image_keywords = any(keyword in question_lower for keyword in image_keywords)

    # If asking for images/diagrams, route to document chatbot
    if has_image_keywords:
        return "document"
    # If has SQL keywords and no doc keywords, route to database
    elif has_sql_keywords and not has_doc_keywords:
        return "database"
    # If has doc keywords, route to document
    elif has_doc_keywords:
        return "document"
    # Default to database for data queries
    elif has_sql_keywords:
        return "database"
    else:
        # Default to document for general questions
        return "document"


@app.route("/analyze")
def analyze():
    """ONLY endpoint that creates timestamped chart folders"""
    try:
        device_df, owner_df, status_df = load_csvs()
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    # Create timestamped chart folder - ONLY when analyze is called
    chart_folder = datetime.now().strftime("charts_%Y%m%d_%H%M%S")
    chart_folder_path = os.path.join(BASE_DIR, chart_folder)
    os.makedirs(chart_folder_path, exist_ok=True)

    logging.info(f"Creating charts in folder: {chart_folder_path}")

    chart_files, summaries = generate_charts_and_summaries(device_df, status_df, chart_folder_path)
    metrics = calculate_metrics(device_df, owner_df)

    chart_titles = {
        "chart1_device_type_distribution": "Device Type Distribution",
        "chart2_manufacturer_vs_type": "Manufacturer vs Device Type",
        "chart3_assignment_metrics": "Device Assignment Metrics",
        "chart4_procurement_trends": "Device Procurement Trends"
    }

    ordered_summaries, ordered_titles = [], []
    for k in chart_files.keys():
        summary = summaries.get(k, [])
        if isinstance(summary, list):
            ordered_summaries.append("\n".join([f"• {s}" for s in summary]))
        else:
            ordered_summaries.append(f"• {summary}")
        ordered_titles.append(chart_titles.get(k, k))

    # Return PNG files for charts array (for Dashboard.js compatibility) and HTML for html_charts
    return jsonify({
        "charts": [v["png"] for v in chart_files.values()],
        "html_charts": [v["html"] for v in chart_files.values()],
        "folder": chart_folder,
        "summaries": ordered_summaries,
        "titles": ordered_titles,
        "metrics": metrics
    })


@app.route("/charts/<folder>/<filename>")
def serve_chart(folder, filename):
    return send_from_directory(os.path.join(BASE_DIR, folder), filename)


@app.route("/images/<filename>")
def serve_image(filename):
    """Serve images for document chatbot"""
    try:
        image_dir = os.path.join(BASE_DIR, "images")
        return send_from_directory(image_dir, filename)
    except Exception as e:
        logging.error(f"Error serving image {filename}: {str(e)}")
        return "Image not found", 404


@app.route("/unified_chat", methods=["POST"])
def unified_chat():
    """Unified chatbot endpoint that routes to appropriate chatbot - NO CHART GENERATION HERE"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400

        question = data.get("question", "").strip()
        history = data.get("history", [])
        summaries = data.get("summaries", {})
        context_choice = data.get("context_choice", None)
        chatbot_type = data.get("chatbot_type", None)

        if not question:
            return jsonify({'error': 'No question provided'}), 400

        # Handle greetings
        greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening']
        question_lower = question.lower().strip()
        if any(greeting == question_lower or question_lower.startswith(greeting + ' ') for greeting in greetings):
            return jsonify({
                "answer": "Hello! I'm Bob, your AI assistant. I can help you with device data analysis, owner information, status tracking, and also answer questions about the Device Management Portal features and show you relevant diagrams. What would you like to know?",
                "type": "text",
                "chatbot_type": "general"
            })

        # Handle database-specific special commands
        if question.lower() == "clear context":
            clear_context()
            return jsonify({
                "answer": "Context cleared! You can now ask fresh questions.",
                "type": "text",
                "chatbot_type": "database"
            })
        elif question.lower() == "show context":
            current_context = get_current_context()
            if current_context:
                context_str = ", ".join([f"{k}: {v}" for k, v in current_context.items()])
                return jsonify({
                    "answer": f"Current context: {context_str}",
                    "type": "text",
                    "chatbot_type": "database"
                })
            else:
                return jsonify({
                    "answer": "No context is currently stored.",
                    "type": "text",
                    "chatbot_type": "database"
                })

        # Determine chatbot type if not specified
        if not chatbot_type:
            chatbot_type = determine_chatbot_type(question)

        logging.info(f"Question: {question}, Determined chatbot type: {chatbot_type}")

        if chatbot_type == "database":
            # Use database chatbot (your existing chatbot.py)
            device_df, owner_df, status_df = load_csvs()

            # Check for ambiguous questions first
            suggestions = get_context_suggestions(question)
            if suggestions and not context_choice:
                return jsonify({
                    "answer": "I found multiple ways to interpret your question. Please choose one:",
                    "type": "text",
                    "context_suggestions": suggestions,
                    "ambiguous": True,
                    "chatbot_type": "database"
                })

            # REMOVED: No temporary chart creation here
            # If summaries are needed for chatbot functionality, pass empty dict or existing summaries
            if not summaries:
                summaries = {}  # Use empty summaries for chatbot, don't generate charts

            # Use the database chatbot logic from chatbot.py
            response = ask_question(question, history, summaries, device_df, owner_df, status_df)

            # Handle different response types
            if isinstance(response, dict):
                response_data = {
                    "answer": response.get("content", ""),
                    "type": response.get("type", "text"),
                    "chatbot_type": "database"
                }
                if response.get("type") == "table":
                    response_data["summary"] = "First 20 rows"
                elif response.get("summary"):
                    response_data["summary"] = response["summary"]
            else:
                response_data = {
                    "answer": response,
                    "type": "text",
                    "chatbot_type": "database"
                }

            return jsonify(response_data)

        else:
            # Use document chatbot (separate doc_chatbot.py)
            response_data = handle_document_question(question, history)
            response_data["chatbot_type"] = "document"
            return jsonify(response_data)

    except Exception as e:
        logging.error("Unified chatbot route failed: %s", traceback.format_exc())
        return jsonify({"error": str(e), "type": "text"}), 500


@app.route("/context", methods=["GET", "POST"])
def context_route():
    """Handle context management via API (database chatbot only)"""
    if request.method == "GET":
        return jsonify({"context": get_current_context()})
    elif request.method == "POST":
        data = request.get_json()
        action = data.get("action", "")

        if action == "clear":
            clear_context()
            return jsonify({"message": "Context cleared", "context": {}})
        elif action == "set":
            new_context = data.get("context", {})
            set_context(new_context)
            return jsonify({"message": "Context updated", "context": get_current_context()})
        else:
            return jsonify({"error": "Invalid action"}), 400


if __name__ == "__main__":
    # Disable Kaleido/Plotly verbose logging
    logging.getLogger('kaleido').setLevel(logging.ERROR)
    logging.getLogger('choreographer').setLevel(logging.ERROR)
    logging.getLogger('plotly').setLevel(logging.ERROR)

    app.run(debug=True, port=5000)