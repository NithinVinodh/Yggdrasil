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

# Router 
router = APIRouter(prefix="/clinicalnotes", tags=["ClinicalNotes"])

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

def identify_disease_and_risk(text: str) -> str:
    """
    Run Ollama mistral model for NLP disease identification.
    Distinguishes between mental health and non-mental health notes.
    """
    prompt = f"""
You are a mental health medical NLP assistant.

From the following clinical note, determine if it relates to mental health.

If it does, identify the disease mentioned, determine the risk level, and provide a medical suggestion.

If it does not, return the message: "The document is not related to mental health or is invalid."

Present the output in this exact structured format only if the note is related to mental health:

Disease Name: [Name of the disease]
Risk Level: [Low / Moderate / High]
Suggestion: [Provide a short actionable medical suggestion]

Clinical Note:
\"\"\"{text}\"\"\"
"""

    result = subprocess.run(
        ["ollama", "run", "mistral"],
        input=prompt,
        text=True,
        capture_output=True,
        encoding="utf-8",
        errors="ignore"
    )

    if result.returncode != 0 or not result.stdout.strip():
        return "The document is not related to mental health or is invalid."

    return result.stdout.strip()

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

        if ext == ".pdf":
            extracted_text = extract_text_from_pdf(temp_file)
        elif ext == ".docx":
            extracted_text = extract_text_from_word(temp_file)
        else:
            extracted_text = extract_text_from_image(temp_file)

        os.remove(temp_file)

        if not extracted_text:
            raise HTTPException(status_code=400, detail="No text extracted from the file.")

        result = identify_disease_and_risk(extracted_text)

        if result.strip().startswith("The document is not related"):
            raise HTTPException(status_code=400, detail="The document is not related to mental health or is invalid.")

        disease_name = next((line.split(":", 1)[1].strip() for line in result.splitlines() if line.startswith("Disease Name:")), None)
        risk_level = next((line.split(":", 1)[1].strip() for line in result.splitlines() if line.startswith("Risk Level:")), None)
        suggestion = next((line.split(":", 1)[1].strip() for line in result.splitlines() if line.startswith("Suggestion:")), None)

        if not disease_name or not suggestion or disease_name.lower() == "n/a" or suggestion.lower() == "n/a":
            raise HTTPException(status_code=400, detail="Invalid document. Please upload a proper clinical note.")

        patient = db.query(Patient).filter(Patient.id == patient_id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        patient.disease_name = disease_name
        patient.riskLevel = risk_level
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
        print("Backend Error:", str(e))
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail="Internal Server Error")
