from fastapi import APIRouter
from pydantic import BaseModel
from transformers import pipeline
import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

# Router 
router = APIRouter(prefix="/chatbot", tags=["Chatbot"])

# HuggingFace emotion classifier
emotion_classifier = pipeline(
    "text-classification",
    model="joeddav/distilbert-base-uncased-go-emotions-student"
)

genai.configure(api_key=API_KEY)

class ChatRequest(BaseModel):
    message: str

@router.get("/")
def root():
    return {"message": "Chatbot router running!"}

@router.post("/chat")
async def chat(req: ChatRequest):
    user_input = req.message

    emotions = emotion_classifier(user_input)
    top_emotion = emotions[0]["label"]

    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content(
        f"User feels {top_emotion}. provide only four lines of reply. "
        f"Respond empathetically and supportively to this: {user_input}"
    )

    return {"bot": response.text, "emotion": top_emotion}
