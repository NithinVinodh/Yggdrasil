from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
import joblib
import numpy as np
from uuid import UUID

from database import get_db
from models import Patient
from auth import get_current_user   # ✅ JWT Auth

# ✅ Router instance
router = APIRouter(prefix="/patient", tags=["Risk Prediction"])

# Load ML model + encoders
model = joblib.load(r"D:\Development\yggdrasil\CTS_finalbe\model\risk_model_hgb.pkl")
encoders = joblib.load(r"D:\Development\yggdrasil\CTS_finalbe\model\encoders.pkl")

# ✅ Request body schema
class InputData(BaseModel):
    patient_id: UUID
    age: int
    gender: str
    mood_score: int
    sleep_quality: int
    stress_level: int
    emotional_state: str


# ✅ Helper: Safe transform for unseen labels
def safe_transform(encoder, value: str):
    if value not in encoder.classes_:
        encoder.classes_ = np.append(encoder.classes_, value)  # Add unseen label
    return encoder.transform([value])[0]


# ✅ Endpoint
@router.post("/riskprediction")
def predict_and_store_risk(
    data: InputData,
    db: Session = Depends(get_db),
    current_user: Patient = Depends(get_current_user)
):
    try:
        # Encode categorical fields
        gender_encoded = safe_transform(encoders["Gender"], data.gender)
        emotion_encoded = safe_transform(encoders["Emotional_State"], data.emotional_state)

        # Arrange input as NumPy array
        X = np.array([[
            data.age,
            gender_encoded,
            data.mood_score,
            data.sleep_quality,
            data.stress_level,
            emotion_encoded
        ]])

        # Predict
        prediction = model.predict(X)[0]

        # Always use logged-in user from token
        patient = db.query(Patient).filter(Patient.id == current_user.id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")

        # Save prediction
        patient.riskLevel = str(prediction)
        db.commit()
        db.refresh(patient)

        return {
            "success": True,
            "message": "Risk level predicted and stored successfully",
            "patient_id": str(patient.id),
            "riskLevel": patient.riskLevel
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
