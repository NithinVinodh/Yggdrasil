import os
import shutil
import subprocess
import traceback
import pdfplumber
import pytesseract
import docx
from PIL import Image
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from database import get_db
from models import Patient

# Router instance
router = APIRouter(prefix="/clinicalnotes", tags=["Clinical Notes"])

# ---------- Extractors ----------
def extract_text_from_pdf(file_path):
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text.strip()

def extract_text_from_word(file_path):
    doc = docx.Document(file_path)
    return "\n".join([p.text for p in doc.paragraphs]).strip()

def extract_text_from_image(file_path):
    image = Image.open(file_path)
    return pytesseract.image_to_string(image).strip()

# ---------- AI Prompt ----------
def identify_disease_and_risk(text: str) -> str:
    """
    Run Ollama tinyllama model for NLP disease identification.
    Provides long suggestions and detailed output.
    """
    prompt = f"""
You are a medical text classifier specialized in mental health.

Task: Extract mental health disease, risk level, and provide a long, detailed suggestion.

Examples:

Clinical Note: "Patient feels sad, hopeless, avoids social contact."
Output:
Disease Name: Depression
Risk Level: High
Suggestion: The patient exhibits classical signs of depression including sadness, hopelessness, and social withdrawal. Immediate consultation with a psychiatrist is recommended, along with a structured therapy plan and support from family or caregivers. Consider regular counseling sessions, mindfulness practices, and monitoring for any suicidal thoughts or tendencies.

Clinical Note: "Patient is anxious before exams but manages with breathing."
Output:
Disease Name: Anxiety
Risk Level: Low
Suggestion: The patient experiences situational anxiety related to exams but is able to manage it with relaxation techniques. Encourage continued use of deep breathing, mindfulness, and structured study schedules. Consider support groups or counseling for coping strategies if anxiety increases.

Clinical Note: "Patient reports difficulty concentrating, hyperactivity, and impulsive behavior."
Output:
Disease Name: ADHD
Risk Level: Moderate
Suggestion: The patient shows signs of ADHD including hyperactivity, impulsivity, and concentration difficulties. Recommend behavioral therapy, organizational strategies, and potentially consultation with a specialist for medication evaluation. Encourage structured routines and positive reinforcement strategies.

Now analyze the following clinical note:

Clinical Note:
\"\"\"{text}\"\"\" 

Output strictly in the same format. Provide detailed suggestions. Do not output 'N/A'. If unable to determine, give a generic but meaningful suggestion.
"""

    result = subprocess.run(
        ["ollama", "run", "tinyllama"],
        input=prompt,
        text=True,
        capture_output=True,
        encoding="utf-8",
        errors="ignore"
    )

    if result.returncode != 0 or not result.stdout.strip():
        return (
            "Disease Name: General Mental Health Concern\n"
            "Risk Level: Moderate\n"
            "Suggestion: Patient exhibits some symptoms that may indicate stress "
            "or mental health issues. Recommend regular counseling sessions, relaxation "
            "exercises, and monitoring of mood and behavior. Seek professional advice "
            "if symptoms persist or worsen."
        )

    return result.stdout.strip()

# ---------- ROUTE ----------
@router.post("/analyze")
async def analyze_document(
    patient_id: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in [".pdf", ".docx", ".jpg", ".jpeg", ".png"]:
            raise HTTPException(status_code=400, detail="Unsupported file format. Only PDF, DOCX, JPG, and PNG allowed.")

        temp_file = f"temp_{file.filename}"
        with open(temp_file, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Extract text
        if ext == ".pdf":
            extracted_text = extract_text_from_pdf(temp_file)
        elif ext == ".docx":
            extracted_text = extract_text_from_word(temp_file)
        else:
            extracted_text = extract_text_from_image(temp_file)

        os.remove(temp_file)

        if not extracted_text:
            raise HTTPException(status_code=400, detail="No text extracted from the file.")

        # Run AI model
        result = identify_disease_and_risk(extracted_text)

        # Parse output
        disease_name = next((line.split(":", 1)[1].strip() for line in result.splitlines() if line.startswith("Disease Name:")), None)
        risk_level = next((line.split(":", 1)[1].strip() for line in result.splitlines() if line.startswith("Risk Level:")), None)
        suggestion = next((line.split(":", 1)[1].strip() for line in result.splitlines() if line.startswith("Suggestion:")), None)

        # Store in DB
        patient = db.query(Patient).filter(Patient.id == patient_id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        patient.disease_name = disease_name
        patient.riskLevel = risk_level
        # If you have a 'suggestion' column in Patient model:
        # patient.suggestion = suggestion
        db.commit()
        db.refresh(patient)

        return JSONResponse(content={
            "patient_id": patient_id,
            "disease_name": disease_name,
            "risk_level": risk_level,
            "suggestion": suggestion,
            "raw_output": result
        })

    except HTTPException as he:
        raise he
    except Exception as e:
        print("🔥 Backend Error:", str(e))
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail="Internal Server Error")
