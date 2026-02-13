
import os
import json
import google.generativeai as genai
from openai import OpenAI
from anthropic import Anthropic
import base64
import io

# common prompt
SYSTEM_PROMPT = """
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

def analyze_with_gemini(api_key, image_bytes):
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-2.5-flash") # use 2.5-flash as requested
        
        from PIL import Image
        image = Image.open(io.BytesIO(image_bytes))
        
        response = model.generate_content(
            [SYSTEM_PROMPT, image], 
            generation_config={"response_mime_type": "application/json"}
        )
        
        return json.loads(response.text.strip())
    except Exception as e:
        return {"error": str(e), "chunked_text": f"Error: {str(e)}", "simplified_text": "Error processing with Gemini"}

def analyze_with_openai(api_key, image_bytes, base_url=None, model_name="gpt-4o"):
    try:
        client = OpenAI(api_key=api_key, base_url=base_url)
        
        # encode image to base64
        base64_image = base64.b64encode(image_bytes).decode('utf-8')
        
        response = client.chat.completions.create(
            model=model_name,
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Analyze this image based on the system instructions."
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            response_format={"type": "json_object"}
        )
        
        content = response.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        return {"error": str(e), "chunked_text": f"Error: {str(e)}", "simplified_text": "Error processing with OpenAI/Compatible"}

def analyze_with_anthropic(api_key, image_bytes):
    try:
        client = Anthropic(api_key=api_key)
        
        base64_image = base64.b64encode(image_bytes).decode('utf-8')
        media_type = "image/jpeg"

        response = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": media_type,
                                "data": base64_image,
                            },
                        },
                        {
                            "type": "text",
                            "text": "Analyze this image and return JSON."
                        }
                    ],
                }
            ]
        )
        
        # parse json
        text = response.content[0].text
        # naive json extraction if claude chats
        start = text.find('{')
        end = text.rfind('}') + 1
        if start >= 0 and end > start:
            return json.loads(text[start:end])
        return {"error": "Invalid JSON from Claude", "raw": text}

    except Exception as e:
        return {"error": str(e), "chunked_text": f"Error: {str(e)}", "simplified_text": "Error processing with Claude"}
