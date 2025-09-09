from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List,Dict

from database import get_db
from models import Insurer, Patient, Application
from auth import get_current_user, create_access_token, verify_password,get_password_hash
from schemas import (
    InsurerSignup, InsurerLogin, InsurerToken, InsurerResponse,
    InsurerUpdateRequest, UpdateApplicationStatus,
    PatientApplicationOut, AppointmentRequest,PatientAppointmentOut
)
from utils import send_status_email, send_appointment_email

#router 
router = APIRouter(prefix="/insurer", tags=["Insurer"])


#---Insurer Routes---

#Signup
@router.post("/signup", response_model=InsurerToken)
def insurer_signup(user: InsurerSignup, db: Session = Depends(get_db)):
    existing = db.query(Insurer).filter(Insurer.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Insurer email already registered")

    hashed_pw = get_password_hash(user.password)
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

#Login
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

#Profile
@router.get("/profile", response_model=InsurerResponse)
def get_current_insurer_profile(
    db: Session = Depends(get_db),
    current_insurer: Insurer = Depends(get_current_user)
):
    insurer = db.query(Insurer).filter(Insurer.id == current_insurer.id).first()
    if not insurer:
        raise HTTPException(status_code=404, detail="Insurer not found")
    return insurer


#Update 
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


#---Insurer Platform---

#Update application status
@router.put("/application/{application_id}")
def update_patient_status(
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

    patient = db.query(Patient).filter(Patient.id == app_record.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    patient.applnStatus = body.status       
    patient.apptStatus = "pending"          
    db.commit()
    db.refresh(patient)

    app_record.status = body.status
    db.commit()
    db.refresh(app_record)

    send_status_email(patient.email, patient.name, body.status)


    return {
        "application_id": app_record.id,
        "application_status": app_record.status,
        "patient_id": patient.id,
        "patient_applnStatus": patient.applnStatus,
        "patient_apptStatus": patient.apptStatus,
        "message": f"Application {body.status} successfully"
    }


# Application details
@router.get("/patient-applications", response_model=List[PatientApplicationOut])
def get_patient_applications(
    db: Session = Depends(get_db),
    current_insurer: Insurer = Depends(get_current_user)
):
    applications = db.query(Application).filter(
        Application.insurer_id == current_insurer.id
    ).all()

    result = []

    for app_record in applications:
        patient = db.query(Patient).filter(Patient.id == app_record.patient_id).first()
        if not patient:
            continue

        if patient.applnStatus != "pending":
            continue

        appt_status = patient.apptStatus or "pending"

        result.append(PatientApplicationOut(
            application_id=app_record.id,
            patient_id=patient.id,
            insurer_id=app_record.insurer_id,
            name=patient.name,
            age=patient.age,
            gender=patient.gender,
            riskLevel=patient.status or "undiagnosed",
            moodScore=patient.moodScore,
            apptStatus=appt_status,
            applnStatus=patient.applnStatus, 
            showBookBtn=(appt_status == "pending")
        ))

    return result


#Appointment details
@router.get("/patient-appointments", response_model=List[PatientAppointmentOut])
def get_patient_appointments(
    db: Session = Depends(get_db),
    current_insurer: Insurer = Depends(get_current_user)
):
    applications = (
        db.query(
            Application.id.label("application_id"), 
            Patient
        )
        .join(Patient, Patient.id == Application.patient_id)
        .filter(Application.insurer_id == current_insurer.id)
        .all()
    )

    result = []
    for app_id, patient in applications:
        result.append(
            PatientAppointmentOut(
                patient_id=str(patient.id),
                application_id=str(app_id),   
                name=patient.name,
                age=patient.age,
                gender=patient.gender,
                riskLevel=patient.riskLevel or "unknown",
                moodScore=patient.moodScore or 0,
                status=patient.status,
                apptStatus=patient.apptStatus or "pending",
            )
        )
    return result

#Appointment Booking
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

    if patient.apptStatus == "scheduled":
        raise HTTPException(status_code=400, detail="Already scheduled")

    patient.apptStatus = "scheduled"
    patient.appointment_datetime = request.scheduled_datetime
    db.commit()
    db.refresh(patient)

    # email notification
    send_appointment_email(patient.email, patient.name, request.scheduled_datetime)

    return {
        "message": "Appointment scheduled successfully",
        "apptStatus": patient.apptStatus,
        "patient_id": patient.id
    }


#Dashboard stats
@router.get("/dashboard/stats")
def get_dashboard_stats(
    district: str,
    db: Session = Depends(get_db)
) -> Dict:


    #Total healthcare providers in that district
    total_providers = (
        db.query(Insurer)
        .filter(Insurer.district == district)
        .count()
    )

    #Patients in the given district
    patients_in_district = (
        db.query(Patient)
        .filter(Patient.district == district)
        .count()
    )

    #Adequacy (1 provider = 15 patients)
    max_capacity = total_providers * 15
    is_adequate = patients_in_district <= max_capacity
    status = "Adequate" if is_adequate else "Inadequate"

    if is_adequate:
        note = (
            f"Your district '{district}' has adequate healthcare coverage. "
            f"Current capacity can handle {max_capacity} patients with {patients_in_district} currently registered."
        )
    else:
        excess_patients = patients_in_district - max_capacity
        needed_providers = (excess_patients // 15) + 1
        note = (
            f"Your district '{district}' has inadequate healthcare providers. "
            f"You need {needed_providers} more providers to adequately serve {patients_in_district} patients."
        )

    return {
        "district": district,
        "total_providers": total_providers,
        "patients_in_district": patients_in_district,
        "status": status,
        "note": note,
        "is_adequate": is_adequate,
    }
