# utils.py
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from dotenv import load_dotenv


load_dotenv()
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))


#Email status
def send_status_email(patient_email: str, patient_name: str, status: str):
    """
    Send an email to the patient notifying them about the insurance application status,
    with a warm message encouraging mental health care.
    """
    subject = f"Your Insurance Application has been {status.capitalize()}"

    body = (
        f"Hello {patient_name},\n\n"
        f"Your insurance application status has been updated to: {status.upper()}.\n\n"
        "Thank you for trusting us with your health journey.\n\n"
        "At our care center, we believe that mental health is just as important as physical health. "
        "This is a step forward in ensuring you receive the support you deserve.\n\n"
        "Let's connect and work together for better mental health care.\n"
        "Remember, you are not alone — we are here to support you every step of the way.\n\n"
        "Warm regards,\n"
        "Insurer Provider 💙"
    )

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



#Appointment Email
def send_appointment_email(patient_email: str, patient_name: str, appt_datetime: datetime):
    """
    Send an email to the patient notifying them about the scheduled appointment,
    with a supportive mental health message.
    """
    subject = "Your Mental Health Appointment is Scheduled from your insurer team"

    body = (
        f"Hello {patient_name},\n\n"
        f"Your appointment has been scheduled on {appt_datetime.strftime('%A, %B %d, %Y at %I:%M %p')}.\n\n"
        "Thank you.\n\n"
        "---------------------------------------------\n\n"
        "Your mental health is our priority, and we’ve scheduled this appointment to support your well-being.\n\n"
        "We understand that you often focus on physical health, but remember that mental health is just as important. "
        "Taking this step shows your strength and commitment to self-care.\n\n"
        "Please arrive on time for your session.\n"
        "Come with an open mind and share freely — we are here to listen and support you.\n\n"
        "Your well-being matters to us. Together, we’ll work towards a healthier mind and a better you.\n\n"
        "Warm regards,\n"
        "Insurer Provider 💙"
    )

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
