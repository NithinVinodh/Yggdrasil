from sqlalchemy import Column, String, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
import uuid
from datetime import datetime

class Patient(Base):
    __tablename__ = "PATIENTS"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(20), nullable=False)
    contactNo = Column(String(20), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    address = Column(String(255), nullable=False)
    district = Column(String(100), nullable=False)
    country = Column(String(100), nullable=False)
    status = Column(String(50), default="undiagnosed")
    moodScore = Column(Integer, nullable=True)
    riskLevel = Column(Integer, nullable=True)
    apptStatus = Column(String, default="pending")
    applnStatus = Column(String(50), nullable=True)
    appointment_datetime = Column(DateTime, nullable=True)
    disease_name = Column(String(100), nullable=False)

    applications = relationship("Application", back_populates="patient")


class Insurer(Base):
    __tablename__ = "INSURERS"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    companyName = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    contactNo = Column(String(20), nullable=False)
    address = Column(String(255), nullable=False)
    district = Column(String(100), nullable=False)
    country = Column(String(100), nullable=False)

    applications = relationship("Application", back_populates="insurer")


class Application(Base):
    __tablename__ = "APPLICATIONS"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), ForeignKey("PATIENTS.id"), nullable=False)
    insurer_id = Column(String(36), ForeignKey("INSURERS.id"), nullable=False)
    status = Column(String(50), default="pending")

    patient = relationship("Patient", back_populates="applications")
    insurer = relationship("Insurer", back_populates="applications")
