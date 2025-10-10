import os
import requests
import logging
import re
from difflib import SequenceMatcher
from docx import Document

# GROQ API credentials


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BASE_DIR = r"<<BASE_DIR>>\capstone5\pythonservice"
IMAGE_DIR = r"<<BASE_DIR>>\capstone5\pythonservice\images"
SUPPORTED_IMAGE_EXTS = [".png", ".jpg", ".jpeg"]

# Synonyms mapping for better image matching
IMAGE_SYNONYMS = {
    "sequence": ["flow", "process", "workflow", "steps", "diagram"],
    "system": ["architecture", "structure", "design", "framework"],
    "architecture": ["system", "structure", "design", "framework", "layout"],
    "diagram": ["chart", "figure", "image", "picture", "visual"],
    "flow": ["sequence", "process", "workflow", "steps"],
}


def load_document_content():
    """Load and process the Word document text content"""
    try:
        doc_path = os.path.join(BASE_DIR, "chatbot_context.docx")
        doc = Document(doc_path)
        context_text = []

        for para in doc.paragraphs:
            text = para.text.strip()
            if text:
                context_text.append(text)

        context = "\n".join(context_text)
        logger.info(f"Loaded document with {len(context_text)} text paragraphs")
        return context

    except Exception as e:
        logger.error(f"Error loading document: {str(e)}")
        return "Error loading document content."


def get_available_images():
    """Get all available images from the images directory"""
    images = {}

    if not os.path.exists(IMAGE_DIR):
        logger.warning(f"Image directory does not exist: {IMAGE_DIR}")
        return images

    try:
        for filename in os.listdir(IMAGE_DIR):
            file_path = os.path.join(IMAGE_DIR, filename)
            if os.path.isfile(file_path):
                _, ext = os.path.splitext(filename.lower())
                if ext in SUPPORTED_IMAGE_EXTS:
                    name_without_ext = os.path.splitext(filename)[0].lower()
                    image_url = f"http://localhost:5000/images/{filename}"
                    images[name_without_ext] = {
                        'filename': filename,
                        'url': image_url,
                        'name': name_without_ext
                    }

        logger.info(f"Found {len(images)} images in directory")
        return images

    except Exception as e:
        logger.error(f"Error reading image directory: {str(e)}")
        return {}


def similarity(a, b):
    """Calculate similarity between two strings"""
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()


def find_matching_images(user_input, threshold=0.6):
    """Find images that match user input with improved matching"""
    available_images = get_available_images()
    if not available_images:
        return []

    user_words = re.findall(r'\w+', user_input.lower())
    matches = []

    for image_name, image_info in available_images.items():
        image_words = re.findall(r'\w+', image_name.lower())

        # Direct word matching
        max_similarity = 0
        for user_word in user_words:
            for image_word in image_words:
                sim = similarity(user_word, image_word)
                if sim >= threshold:
                    max_similarity = max(max_similarity, sim)

        if max_similarity > 0:
            matches.append({
                'image': image_info,
                'similarity': max_similarity
            })
            continue

        # Synonym matching
        for user_word in user_words:
            for synonym_key, synonyms in IMAGE_SYNONYMS.items():
                if user_word == synonym_key or user_word in synonyms:
                    for image_word in image_words:
                        if image_word == synonym_key or image_word in synonyms:
                            matches.append({
                                'image': image_info,
                                'similarity': 0.8
                            })
                            break
                    if matches and matches[-1]['image']['name'] == image_info['name']:
                        break

    # Remove duplicates and sort by similarity
    unique_matches = {}
    for match in matches:
        image_name = match['image']['name']
        if image_name not in unique_matches or match['similarity'] > unique_matches[image_name]['similarity']:
            unique_matches[image_name] = match

    sorted_matches = sorted(unique_matches.values(), key=lambda x: x['similarity'], reverse=True)
    return [match['image'] for match in sorted_matches]


def is_image_request(text):
    """Check if the user is explicitly asking for an image"""
    # Keywords that indicate image request
    image_keywords = [
        'image', 'picture', 'diagram', 'chart', 'figure', 'visual',
        'architecture', 'sequence', 'flow', 'system'
    ]

    # Action words that suggest showing/displaying
    action_keywords = [
        'show', 'display', 'view', 'see', 'look'
    ]

    text_lower = text.lower()

    # Check if any image-related keyword is present
    has_image_keyword = any(keyword in text_lower for keyword in image_keywords)

    # Check if it's a direct request (contains action word + image keyword)
    has_action = any(action in text_lower for action in action_keywords)

    return has_image_keyword or has_action


def should_format_as_points(text):
    """Check if text should be formatted as numbered points"""
    # Always format responses longer than 50 characters as numbered points
    if len(text.strip()) > 50:
        return True
    return False


def ensure_numbered_points(text):
    """Ensure the response is formatted as numbered points for responses over 50 characters"""
    if len(text.strip()) <= 50:
        return text

    # Split by double newlines to preserve sections
    sections = text.strip().split('\n\n')
    formatted_sections = []

    for section in sections:
        lines = [line.strip() for line in section.split('\n') if line.strip()]

        if not lines:
            continue

        # Check if this is a header line (short and descriptive)
        if len(lines) == 1 and len(lines[0]) < 80:
            # This is likely a section header
            formatted_sections.append(lines[0])
        else:
            # This is content that should be numbered
            formatted_lines = []
            point_number = 1

            for line in lines:
                # Remove existing formatting
                clean_line = re.sub(r'^[#•*\-]\s*', '', line)
                clean_line = re.sub(r'^\d+\.\s*', '', clean_line)

                if clean_line:
                    formatted_lines.append(f"{point_number}. {clean_line}")
                    point_number += 1

            formatted_sections.append('\n'.join(formatted_lines))

    return '\n\n'.join(formatted_sections)


# Alternative simpler version that keeps under 300 chars
def ensure_concise_numbered_points(text):
    """Format as concise numbered points under 300 characters"""
    if len(text.strip()) <= 50:
        return text

    # Split into logical chunks and take key points
    sentences = re.split(r'[.!?]\s+', text.strip())
    key_points = [s.strip() for s in sentences[:5] if s.strip()]  # Limit to 5 points max

    if len(key_points) <= 1:
        return text

    # Format as numbered points
    formatted_points = []
    for i, point in enumerate(key_points, 1):
        # Keep each point concise
        if len(point) > 60:
            point = point[:57] + "..."
        formatted_points.append(f"{i}. {point}")

    result = '\n'.join(formatted_points)

    # Ensure under 300 characters
    if len(result) > 300:
        # Take fewer points
        shorter_points = formatted_points[:3]
        result = '\n'.join(shorter_points)

    return result


def query_groq_api_for_doc(question, context_content, available_images_info="", history=None):
    """Query the GROQ API for document-based questions"""
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    system_content = (
        "You are BOB, a helpful AI assistant for the Device Management Portal. "
        "Answer questions using only the following context:\n"
        f"{context_content}\n\n"

        "CRITICAL FORMATTING RULES:\n"
        "1. If your response will be over 50 characters, format it as numbered points\n"
        "2. Use numbers (1. 2. 3.) for points\n"
        "3. Each numbered point should be concise - maximum 1-2 sentences\n"
        "4. Do NOT use markdown headers (# ## ###) - convert them to numbered points\n"
        "5. Keep responses comprehensive but concise under 300 characters when possible\n"
        "6. Avoid repetitive or overly detailed explanations\n\n"

        "Content Rules:\n"
        "- Answer questions using the provided context\n"
        "- If no relevant info found, say you don't have that information\n"
        "- For device data queries, refer to the Data tab\n"
        "- Provide clear, structured explanations\n"
        "- Focus on key points and main features\n"
    )

    if available_images_info:
        system_content += f"\nAvailable images: {available_images_info}\n"

    messages = [{"role": "system", "content": system_content}]

    if history:
        for msg in history:
            role = "assistant" if msg.get("sender") == "bot" else "user"
            messages.append({"role": role, "content": msg.get("text", "")})

    messages.append({"role": "user", "content": question})

    payload = {
        "model": "meta-llama/llama-4-scout-17b-16e-instruct",
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 400  # Reduced for concise responses
    }

    try:
        response = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        result = response.json()
        answer = result["choices"][0]["message"]["content"]

        # Always format as numbered points if over 50 characters
        formatted_answer = ensure_numbered_points(answer)
        return formatted_answer

    except Exception as e:
        logger.error(f"GROQ API request failed: {str(e)}")
        return "I'm having trouble processing your request right now. Please try again in a moment."


# Load document context on module import
document_context = load_document_content()


def handle_document_question(question, history=None):
    """Main function to handle document-based questions with image-first approach"""

    question_lower = question.lower()

    # Check for very specific data queries that should ONLY go to Data tab
    specific_data_patterns = [
        r"how many (devices|tablets|laptops|smartphones|owners)",
        r"count (of )?(devices|tablets|laptops|smartphones)",
        r"sql query",
        r"database query"
    ]

    is_specific_data_query = any(re.search(pattern, question_lower) for pattern in specific_data_patterns)

    if is_specific_data_query:
        return {
            'answer': "For device data queries and analysis, please use the 'Data' tab.",
            'type': 'text'
        }

    # Check if user is asking for images (without explanation keywords)
    explanation_keywords = ['explain', 'describe', 'tell me', 'what', 'how', 'why', 'detail']
    has_explanation_request = any(keyword in question_lower for keyword in explanation_keywords)

    if is_image_request(question) and not has_explanation_request:
        matching_images = find_matching_images(question)

        if matching_images:
            # Return ONLY images when user asks for images without explanation
            return {
                'answer': '',  # No text answer
                'type': 'image_only',
                'images': [img['url'] for img in matching_images]
            }
        else:
            return {
                'answer': "No matching images found for your request.",
                'type': 'text'
            }

    # For all other requests (explanations, descriptions, etc.), provide text response
    answer = query_groq_api_for_doc(question, document_context, history=history)

    return {
        'answer': answer,
        'type': 'text'
    }