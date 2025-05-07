# server/python/generate_questions.py
import sys
import fitz  # PyMuPDF
import io
import os
import json
import google.generativeai as genai
from dotenv import load_dotenv
import re  # Import the regular expression module

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

def extract_text_from_pdf_bytes(pdf_bytes):
    try:
        text = ""
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        for page in doc:
            text += page.get_text()
        return text
    except Exception as e:
        print(f"Error extracting text from PDF: {e}", file=sys.stderr)
        return ""

def generate_questions(text):
    prompt = f"""
Generate 15 multiple choice questions with 4 options and correct answers based on the following content.

Content:
\"\"\"
{text}
\"\"\"

Format:
[
    {{
        "question": "...",
        "options": ["A", "B", "C", "D"],
        "answer": "B"
    }},
    ...
]
"""

    model = genai.GenerativeModel("gemini-1.5-pro-latest")
    try:
        response = model.generate_content(prompt)
        generated_text = "".join(part.text for part in response.parts)

        # Use regular expression to find the JSON within the code block
        match = re.search(r"```json\n(.*?)\n```", generated_text, re.DOTALL)
        if match:
            json_string = match.group(1)
            return json.loads(json_string)
        else:
            # If no code block is found, try parsing the raw text
            try:
                return json.loads(generated_text)
            except json.JSONDecodeError as e:
                print(f"JSON Decode Error (after regex): {e}", file=sys.stderr)
                print("Raw response content:\n", generated_text, file=sys.stderr)
                return []

    except Exception as e:
        print(f"Error generating questions: {e}", file=sys.stderr)
        return []

if __name__ == "__main__":
    pdf_data = sys.stdin.buffer.read()
    content = extract_text_from_pdf_bytes(pdf_data)
    if content:
        questions = generate_questions(content)
        print(json.dumps(questions))
    else:
        print(json.dumps([])) # Return an empty JSON array if no content