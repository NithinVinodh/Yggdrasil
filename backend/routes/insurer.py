from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import Insurer, Patient, Application
from auth import get_current_user, create_access_token, verify_password
from schemas import (
    InsurerSignup, InsurerLogin, InsurerToken, InsurerResponse,
    InsurerUpdateRequest, UpdateApplicationStatus,
    PatientApplicationOut, AppointmentRequest
)
from utils import send_status_email, send_appointment_email

router = APIRouter(prefix="/insurer", tags=["Insurers"])


# ------------------ SIGNUP ------------------
@router.post("/signup", response_model=InsurerToken)
def insurer_signup(user: InsurerSignup, db: Session = Depends(get_db)):
    existing = db.query(Insurer).filter(Insurer.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Insurer email already registered")

    hashed_pw = auth.get_password_hash(user.password)
    new_insurer = Insurer(**user.dict(exclude={"password"}), password=hashed_pw)
    db.add(new_insurer)
    db.commit()
    db.refresh(new_insurer)

    token = create_access_token(
        {"sub": new_insurer.email, "role": "insurer", "id": new_insurer.id}
    )
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": "insurer",
        "id": new_insurer.id,
    }


# ------------------ LOGIN ------------------
@router.post("/login", response_model=InsurerToken)
def insurer_login(user: InsurerLogin, db: Session = Depends(get_db)):
    insurer = db.query(Insurer).filter(Insurer.email == user.email).first()
    if not insurer or not verify_password(user.password, insurer.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = create_access_token(
        {"sub": insurer.email, "role": "insurer", "id": insurer.id}
    )
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": "insurer",
        "id": insurer.id,
    }


# ------------------ PROFILE ------------------
@router.get("/profile", response_model=InsurerResponse)
def get_current_insurer_profile(
    db: Session = Depends(get_db),
    current_insurer: Insurer = Depends(get_current_user)
):
    insurer = db.query(Insurer).filter(Insurer.id == current_insurer.id).first()
    if not insurer:
        raise HTTPException(status_code=404, detail="Insurer not found")
    return insurer


# ------------------ UPDATE PROFILE ------------------
@router.put("/update", response_model=InsurerResponse)
def update_insurer(
    update: InsurerUpdateRequest,
    db: Session = Depends(get_db),
    current_insurer: Insurer = Depends(get_current_user)
):
    insurer = db.query(Insurer).filter(Insurer.id == current_insurer.id).first()
    if not insurer:
        raise HTTPException(status_code=404, detail="Insurer not found")

    for field, value in update.dict(exclude_unset=True).items():
        setattr(insurer, field, value)

    db.commit()
    db.refresh(insurer)
    return insurer


# ------------------ UPDATE APPLICATION STATUS ------------------
@router.put("/application/{application_id}")
def update_application_status(
    application_id: str,
    body: UpdateApplicationStatus,
    db: Session = Depends(get_db),
    current_insurer: Insurer = Depends(get_current_user)
):
    app_record = db.query(Application).filter(
        Application.id == application_id,
        Application.insurer_id == current_insurer.id
    ).first()
    if not app_record:
        raise HTTPException(status_code=404, detail="Application not found")

    if body.status not in ["accepted", "declined"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    app_record.status = body.status
    db.commit()
    db.refresh(app_record)

    patient = db.query(Patient).filter(Patient.id == app_record.patient_id).first()
    if patient:
        patient.apptStatus = "pending"
        db.commit()
        db.refresh(patient)
        send_status_email(patient.email, patient.name, body.status)

    return {
        "application_id": app_record.id,
        "status": app_record.status,
        "patient_id": patient.id,
        "message": f"Application {body.status} successfully"
    }


# ------------------ DASHBOARD APPLICATIONS ------------------
@router.get("/patient-applications", response_model=List[PatientApplicationOut])
def get_patient_applications(
    db: Session = Depends(get_db),
    current_insurer: Insurer = Depends(get_current_user)
):
    applications = db.query(Application).filter(Application.insurer_id == current_insurer.id).all()
    result = []

    for app_record in applications:
        patient = db.query(Patient).filter(Patient.id == app_record.patient_id).first()
        if not patient:
            continue

        appt_status = patient.apptStatus or "pending"
        show_book_btn = appt_status != "scheduled"

        result.append(PatientApplicationOut(
            application_id=app_record.id,
            patient_id=patient.id,
            name=patient.name,
            age=patient.age,
            gender=patient.gender,
            riskLevel=patient.status or "undiagnosed",
            moodScore=patient.moodScore,
            apptStatus=appt_status,
            showBookBtn=show_book_btn,
            applnStatus=app_record.status
        ))
    return result


# ------------------ BOOK APPOINTMENT ------------------
@router.post("/book-appointment")
def book_appointment(
    request: AppointmentRequest,
    db: Session = Depends(get_db),
    current_insurer: Insurer = Depends(get_current_user)
):
    app_record = db.query(Application).filter(
        Application.id == request.application_id,
        Application.insurer_id == current_insurer.id
    ).first()
    if not app_record:
        raise HTTPException(status_code=404, detail="Application not found")

    patient = db.query(Patient).filter(Patient.id == app_record.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    patient.apptStatus = "scheduled"
    patient.appointment_datetime = request.scheduled_datetime
    db.commit()
    db.refresh(patient)

    send_appointment_email(patient.email, patient.name, request.scheduled_datetime)

    return {
        "message": "Appointment scheduled successfully",
        "apptStatus": patient.apptStatus,
        "patient_id": patient.id
    }
