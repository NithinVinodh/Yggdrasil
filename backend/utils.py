# utils.py
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from dotenv import load_dotenv

# ------------------ LOAD ENV VARIABLES ------------------
load_dotenv()
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))


# ------------------ SEND STATUS EMAIL ------------------
def send_status_email(patient_email: str, patient_name: str, status: str):
    """
    Send an email to the patient notifying them about the insurance application status.
    """
    subject = f"Your Insurance Application has been {status.capitalize()}"
    body = f"Hello {patient_name},\n\nYour insurance application status has been updated to: {status.upper()}.\n\nThank you."

    msg = MIMEMultipart()
    msg["From"] = EMAIL_USER
    msg["To"] = patient_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(EMAIL_USER, EMAIL_PASSWORD)
            server.sendmail(EMAIL_USER, patient_email, msg.as_string())
    except Exception as e:
        print(f"Error sending status email to {patient_email}: {e}")


# ------------------ SEND APPOINTMENT EMAIL ------------------
def send_appointment_email(patient_email: str, patient_name: str, appt_datetime: datetime):
    """
    Send an email to the patient notifying them about the scheduled appointment.
    """
    subject = "Your Appointment has been Scheduled"
    body = f"Hello {patient_name},\n\nYour appointment has been scheduled on {appt_datetime.strftime('%A, %B %d, %Y at %I:%M %p')}.\n\nThank you."

    msg = MIMEMultipart()
    msg["From"] = EMAIL_USER
    msg["To"] = patient_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(EMAIL_USER, EMAIL_PASSWORD)
            server.sendmail(EMAIL_USER, patient_email, msg.as_string())
    except Exception as e:
        print(f"Error sending appointment email to {patient_email}: {e}")
