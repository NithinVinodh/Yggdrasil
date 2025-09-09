from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Routers
from routes import patient, insurer, careschedule, clinicalnotes, chatbot, riskprediction

app = FastAPI(title="Yggdrasil Backend", version="1.0.0")

#Middleware
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#Prefixes
app.include_router(patient.router, prefix="/patient", tags=["Patient"])
app.include_router(insurer.router, prefix="/insurer", tags=["Insurer"])
app.include_router(careschedule.router, prefix="/careschedule", tags=["CareSchedule"])
app.include_router(clinicalnotes.router, prefix="/clinicalnotes", tags=["ClinicalNotes"])
app.include_router(chatbot.router, prefix="/chatbot", tags=["Chatbot"])
app.include_router(riskprediction.router, prefix="/riskprediction", tags=["RiskPrediction"])

#root
@app.get("/")
def root():
    return {"message": "Yggdrasil Backend is running 🚀"}
