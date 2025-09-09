from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List
import uuid

from database import get_db
from models import Patient, Application, Insurer
from auth import get_current_user, create_access_token, verify_password,get_password_hash
from schemas import (
    PatientSignup, PatientLogin, PatientToken, PatientUpdateRequest,
    PatientUpdateResponse, UpdateApplicationStatus, AppointmentRequest,
    PatientApplicationOut
)
from utils import send_status_email, send_appointment_email

#Router
router = APIRouter(prefix="/patient", tags=["Patient"])


#Signup
@router.post("/signup", response_model=PatientToken)
def patient_signup(user: PatientSignup, db: Session = Depends(get_db)):
    existing = db.query(Patient).filter(Patient.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Patient email already registered")

    hashed_pw = get_password_hash(user.password)
    new_patient = Patient(**user.dict(exclude={"password"}), password=hashed_pw)

    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)

    token = create_access_token(
        {"sub": new_patient.email, "role": "patient", "id": new_patient.id}
    )
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": "patient",
        "id": new_patient.id,
        "status": new_patient.status,
    }


#Login
@router.post("/login", response_model=PatientToken)
def patient_login(user: PatientLogin, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.email == user.email).first()
    if not patient or not verify_password(user.password, patient.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = create_access_token(
        {"sub": patient.email, "role": "patient", "id": patient.id}
    )
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": "patient",
        "id": patient.id,
        "status": patient.status,
    }


#Profile
@router.get("/me", response_model=PatientUpdateResponse)
def get_current_patient(current_user: Patient = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "age": current_user.age,
        "gender": current_user.gender,
        "address": current_user.address,
        "district": current_user.district,
        "country": current_user.country,
        "status": current_user.status,
    }


#Update
@router.put("/update", response_model=PatientUpdateResponse)
def update_patient(
    update: PatientUpdateRequest,
    db: Session = Depends(get_db),
    current_user: Patient = Depends(get_current_user)
):
    patient = db.query(Patient).filter(Patient.id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    for field, value in update.dict(exclude_unset=True).items():
        setattr(patient, field, value)

    db.commit()
    db.refresh(patient)

    return {
        "id": patient.id,
        "name": patient.name,
        "age": patient.age,
        "gender": patient.gender,
        "address": patient.address,
        "district": patient.district,
        "country": patient.country,
        "status": patient.status,
    }


#Moodscore
@router.put("/moodscore")
def update_moodscore(
    moodscore: int = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user: Patient = Depends(get_current_user)
):
    patient = db.query(Patient).filter(Patient.id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    patient.moodScore = moodscore
    db.commit()
    db.refresh(patient)

    return {
        "message": "Moodscore saved successfully",
        "patient_id": patient.id,
        "moodscore": patient.moodScore
    }


#Get by id
@router.get("/{patient_id}")
def get_patient_by_id(patient_id: str, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return {
        "age": patient.age,
        "gender": patient.gender,
        "diseaseName": patient.disease_name,
        "riskLevel": patient.riskLevel,
        "moodscore": patient.moodScore
    }


#Providers in district
@router.get("/{patient_id}/providers")
def get_providers_by_patient(patient_id: str, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    providers = db.query(Insurer).filter(Insurer.district == patient.district).all()
    return [
        {
            "id": p.id,
            "companyName": p.companyName,
            "email": p.email,
            "contactNo": p.contactNo,
            "address": p.address,
            "district": p.district,
            "country": p.country,
        }
        for p in providers
    ]


#Apply for provider
@router.post("/apply/{insurer_id}/{patient_id}")
def apply_insurance(insurer_id: str, patient_id: str, db: Session = Depends(get_db)):
    """
    Patient applies to an insurer:
    - Creates a pending row in Application DB
    - Updates Patient DB applnStatus = "pending"
    """
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    insurer = db.query(Insurer).filter(Insurer.id == insurer_id).first()
    if not insurer:
        raise HTTPException(status_code=404, detail="Insurer not found")

    existing_app = db.query(Application).filter(
        Application.patient_id == patient_id,
        Application.status == "pending"
    ).first()
    if existing_app:
        raise HTTPException(
            status_code=400,
            detail="You already have a pending application with an insurer"
        )

    new_app = Application(
        id=str(uuid.uuid4()),
        patient_id=patient_id,
        insurer_id=insurer_id,
        status="pending"
    )
    db.add(new_app)

    patient.applnStatus = "pending"
    patient.apptStatus = "pending"  
    db.add(patient)

    db.commit()
    db.refresh(new_app)
    db.refresh(patient)

    return {
        "message": "Application submitted successfully",
        "applicationId": new_app.id,
        "patient_id": patient.id,
        "insurer_id": insurer.id,
        "applnStatus": patient.applnStatus,
        "patient_name": patient.name,
        "insurer_name": insurer.companyName,
        "application_status": new_app.status
    }


