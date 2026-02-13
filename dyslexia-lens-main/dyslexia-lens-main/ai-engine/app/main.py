from fastapi import FastAPI, UploadFile, File, Form, Header, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.ai_service import analyze_with_gemini, analyze_with_openai, analyze_with_anthropic
from app.utils import clean_text

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Dyslexia Lens")

# add cors
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TextInput(BaseModel):
    text: str

@app.post("/analyze")
async def analyze_image(
    file: UploadFile = File(...),
    x_ai_provider: Optional[str] = Header("gemini", alias="x-ai-provider"),
    x_ai_api_key: Optional[str] = Header(None, alias="x-ai-api-key"),
    x_ai_model: Optional[str] = Header(None, alias="x-ai-model")
):
    # read the file content as bytes
    content = await file.read()
    
    if not x_ai_api_key:
         return {
            "chunked_text": "⚠️ Missing API Key",
            "simplified_text": "# 🔑 API Key Required\nPlease enter your API Key in the Dashboard to continue.",
            "visuals": [],
            "error": "missing_api_key"
        }

    provider = x_ai_provider.lower()
    
    if provider == "gemini":
        return analyze_with_gemini(x_ai_api_key, content)
    
    elif provider == "openai":
        return analyze_with_openai(x_ai_api_key, content, model_name=x_ai_model or "gpt-4o")
    
    elif provider == "grok":
        # xAI (Grok) is API compatible with OpenAI
        return analyze_with_openai(x_ai_api_key, content, base_url="https://api.x.ai/v1", model_name="grok-beta")
        
    elif provider == "anthropic" or provider == "claude":
        return analyze_with_anthropic(x_ai_api_key, content)
    
    else:
        # default fallback or error
        return {"error": f"Unsupported provider: {provider}"}

@app.get("/")
def read_root():
    return {"message": "Dyslexia Lens AI Engine Running (Multi-Provider)"}
