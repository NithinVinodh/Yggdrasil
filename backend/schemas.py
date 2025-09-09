# schemas.py
from pydantic import BaseModel, EmailStr, validator
from typing import Optional
from datetime import datetime
import re

#regex for validation
PASSWORD_REGEX = re.compile(
    r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
)

#Patient schema
class PatientSignup(BaseModel):
    name: str
    age: int
    gender: str
    contactNo: str
    email: EmailStr
    password: str
    address: str
    district: str
    country: str
    status: str

    @validator("password")
    def validate_password(cls, v):
        if not PASSWORD_REGEX.match(v):
            raise ValueError(
                "Password must be at least 8 chars, contain uppercase, lowercase, digit & special char"
            )
        return v


class PatientLogin(BaseModel):
    email: EmailStr
    password: str


class PatientToken(BaseModel):
    access_token: str
    token_type: str
    role: str
    id: str
    status: str


class PatientUpdateRequest(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    district: Optional[str] = None
    country: Optional[str] = None
    status: Optional[str] = None


class PatientUpdateResponse(BaseModel):
    id: str
    name: str
    age: int
    gender: str
    address: str
    district: str
    country: str
    status: str


#Insurer schema
class InsurerSignup(BaseModel):
    companyName: str
    email: EmailStr
    password: str
    contactNo: str
    address: str
    district: str
    country: str

    @validator("password")
    def validate_password(cls, v):
        if not PASSWORD_REGEX.match(v):
            raise ValueError(
                "Password must be at least 8 chars, contain uppercase, lowercase, digit & special char"
            )
        return v


class InsurerLogin(BaseModel):
    email: EmailStr
    password: str


class InsurerToken(BaseModel):
    access_token: str
    token_type: str
    role: str
    id: str


class InsurerUpdateRequest(BaseModel):
    companyName: Optional[str] = None
    contactNo: Optional[str] = None
    address: Optional[str] = None
    district: Optional[str] = None
    country: Optional[str] = None


class InsurerResponse(BaseModel):
    id: str
    companyName: str
    email: str
    contactNo: str
    address: str
    district: str
    country: str


#Application Schema
class ApplyRequest(BaseModel):
    patientId: str


class ApplicationOut(BaseModel):
    id: str
    patient_name: str
    patient_email: str
    status: str


class UpdateApplicationStatus(BaseModel):
    status: str  


class PatientApplicationOut(BaseModel):
    application_id: str
    patient_id: str
    insurer_id: str
    name: str
    age: int
    gender: str
    riskLevel: Optional[str] = None
    moodScore: Optional[float] = None
    applnStatus: Optional[str] = None  


#Appointment
class AppointmentRequest(BaseModel):
    application_id: str
    scheduled_datetime: datetime

class PatientAppointmentOut(BaseModel):
    patient_id: str
    application_id:str
    name: str
    age: int
    gender: str
    riskLevel: str
    moodScore:int
    status:str
    apptStatus: Optional[str] = "pending"  

