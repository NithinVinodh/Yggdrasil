from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline
import google.generativeai as genai
from dotenv import load_dotenv
import os

# -------------------- CONFIG --------------------
# Load environment variables
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")  # Make sure .env has GOOGLE_API_KEY=your_key

app = FastAPI()

# Enable CORS (allow frontend requests)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # later replace with ["http://localhost:3000"] for security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# HuggingFace emotion classifier
emotion_classifier = pipeline(
    "text-classification",
    model="joeddav/distilbert-base-uncased-go-emotions-student"
)

# Configure Gemini
genai.configure(api_key=API_KEY)

# -------------------- SCHEMA --------------------
class ChatRequest(BaseModel):
    message: str

# -------------------- ROUTES --------------------
@app.get("/")
def root():
    return {"message": "Chatbot backend running!"}

@app.post("/chat")
async def chat(req: ChatRequest):
    user_input = req.message

    # 1. Detect emotion
    emotions = emotion_classifier(user_input)
    top_emotion = emotions[0]["label"]

    # 2. Generate empathetic reply using Gemini
    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content(
        f"User feels {top_emotion}. provide only four lines of reply . Respond empathetically and supportively to this: {user_input}"
    )

    return {"bot": response.text, "emotion": top_emotion}