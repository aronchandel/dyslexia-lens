import os
import json
from dotenv import load_dotenv
import google.generativeai as genai
from PIL import Image
import io

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
print(f"DEBUG: Loaded API Key: {api_key[:5] if api_key else 'None'}...")

genai.configure(api_key=api_key)
model = genai.GenerativeModel("gemini-2.5-flash")

def analyze_page(image_bytes: bytes) -> dict:
    prompt = """
    You are an expert reading assistant for dyslexic students.
    Analyze the visible text in this image.
    
    1.  **Phonetic Chunking**: For any word with 2 or more syllables, insert a center dot (·) between syllables. (Example: 'Un·der·stand·ing'). Do NOT chunk simple words like 'the' or 'was'.
    2.  **Simplification**: Rewrite the text to be simpler (5th-grade level) BUT KEEP THE DOTS (·) in long words. 
        - Use **Markdown Headers (#)** for main topics.
        - Insert meaningful emojis directly into the text.
        - Put **definitions/meanings in `()` brackets** (Example: "nutrition (food)").
    3.  **Visual Anchors**: Identify 1-3 key concepts and suggest an emoji for them (separate list).
    4.  **Scope**: Only analyze the visible text in the image provided.

    Return a JSON object with this structure:
    {
        "chunked_text": "Original text with phonetic chunking.",
        "simplified_text": "Simplified text with Markdown Headers (#), dots (·), emojis, and (definitions).",
        "visuals": [
            {
                "word": "Keyword",
                "emoji": "🧠"
            }
        ]
    }
    """
    
    try:
        image = Image.open(io.BytesIO(image_bytes))
        response = model.generate_content([prompt, image], generation_config={"response_mime_type": "application/json"})
        
        response_text = response.text.strip()
        # clean up markdown code blocks if present
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
            
        return json.loads(response_text.strip())
    except Exception as e:
        print(f"Error in Gemini analysis: {e}")
        # check if it's a quota error (429)
        error_msg = str(e)
        if "429" in error_msg:
             return {
                "chunked_text": "⚠️ AI Usage Limit Reached",
                "simplified_text": "# 🕒 AI Taking a Break\nWe've reached our free usage limit for the AI service. Please wait a moment or try again later.\n\n*You can still read the original document on the left!*",
                "visuals": [],
                "error": "quota_exceeded"
            }
        
        return {
            "chunked_text": f"Error analyzing image: {error_msg}",
            "simplified_text": "Error processing document.",
            "visuals": []
        }
