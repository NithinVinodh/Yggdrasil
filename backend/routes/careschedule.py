import os
import jwt
import google.generativeai as genai
import snowflake.connector
from dotenv import load_dotenv
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

# Gemini AI 
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
ai_model = genai.GenerativeModel("gemini-2.5-flash")

# Router 
router = APIRouter(prefix="/care", tags=["CareSchedule"])

#snowflake connection
def get_snowflake_connection():
    return snowflake.connector.connect(
        user=os.getenv("SNOWFLAKE_USER"),
        password=os.getenv("SNOWFLAKE_PASSWORD"),
        account=os.getenv("SNOWFLAKE_ACCOUNT"),
        database=os.getenv("SNOWFLAKE_DATABASE"),
        schema=os.getenv("SNOWFLAKE_SCHEMA"),
        warehouse=os.getenv("SNOWFLAKE_WAREHOUSE"),
        role=os.getenv("SNOWFLAKE_ROLE"),
    )


@router.get("/patient/{patient_id}")
def get_patient(patient_id: str, request: Request):
    token = request.headers.get("Authorization")

    if not token:
        raise HTTPException(status_code=401, detail="Authorization token missing")
    try:
        jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    try:
        conn = get_snowflake_connection()
        cur = conn.cursor()
        cur.execute("""
    SELECT ID, NAME, AGE, GENDER, DISEASE_NAME, riskLevel, moodScore, DISTRICT, COUNTRY
    FROM PATIENTS
    WHERE ID = %s
""", (patient_id,))

        row = cur.fetchone()
        cur.close()
        conn.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB error: {str(e)}")

    if not row:
        raise HTTPException(status_code=404, detail="Patient not found")

    patient_id_db, name, age, gender, disease, risk, moodscore, district, country = row
    return {
        "id": patient_id_db,
        "name": name,
        "age": age,
        "gender": gender,
        "diseaseName": disease,
        "riskLevel": risk,
        "moodScore": moodscore,
        "district": district,
        "country": country
    }

@router.post("/patient/overall/{patient_id}")
async def overall_suggestion(patient_id: str, request: Request):
    token = request.headers.get("Authorization")
    if not token:
        raise HTTPException(status_code=401, detail="Authorization token missing")

    if token.startswith("Bearer "):
        token = token[7:]

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    try:
        conn = get_snowflake_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT ID, NAME, AGE, GENDER, "DISEASE_NAME", "riskLevel", "moodScore", "DISTRICT", "COUNTRY"
            FROM PATIENTS
            WHERE ID = %s
        """, (patient_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Patient not found")

        patient_id_db, name, age, gender, disease, risk, moodscore, district, country = row
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB error: {str(e)}")
    finally:
        cur.close()
        conn.close()

    patient_info = {
        "id": patient_id_db,
        "name": name,
        "age": age,
        "gender": gender,
        "diseaseName": disease,
        "riskLevel": risk,
        "moodScore": moodscore,
        "district": district,
        "country": country
    }

    prompt = f"""
You are a professional mental health assistant.
Analyze and provide a structured treatment plan for this patient:

Patient Info:
- Disease: {disease}
- Risk Level: {risk}
- Mood Score: {moodscore}
- Location: {district}, {country}

Output Format:
Suggestion:
-> Short summary of current condition
-> Risk level interpretation
-> Actionable lifestyle changes
-> Medical treatment recommendation
-> When to seek immediate help
Give all suggestions in structured format, do not include emergency contacts.
"""
    try:
        response = ai_model.generate_content(prompt)
        suggestion_text = response.text.strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation error: {str(e)}")

    #Fetch insurance providers in same district
    try:
        conn = get_snowflake_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT ID, "companyName", "contactNo", "EMAIL", "ADDRESS", "COUNTRY"
            FROM INSURERS
            WHERE "DISTRICT" = %s
        """, (district,))
        rows = cur.fetchall()
        providers = [
            {
                "id": r[0],
                "companyName": r[1],
                "contactNo": r[2],
                "email": r[3],
                "address": r[4],
                "country": r[5],
            } for r in rows
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB error: {str(e)}")
    finally:
        cur.close()
        conn.close()

    return JSONResponse(content={
        "suggestion": suggestion_text,
        "providers": providers,
        "patientInfo": patient_info
    })
