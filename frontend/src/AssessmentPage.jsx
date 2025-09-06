import React, { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./AssessmentPage.css";
import ProfileIcon from "./components/ProfileIcon";

const AssessmentPage = () => {
  const navigate = useNavigate();

  // Form states
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [moodScore, setMoodScore] = useState("");
  const [sleepQuality, setSleepQuality] = useState("");
  const [stressLevel, setStressLevel] = useState("");
  const [emotionalState, setEmotionalState] = useState("");

  // Response states
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPrediction(null);

    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user")); // ✅ get user from localStorage

      if (!user || user.role !== "patient") {
        setError("Only patients can submit this form.");
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:8000/patient/riskprediction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          patient_id: user.id,          // ✅ send patient_id
          age: Number(age),
          gender,
          mood_score: Number(moodScore),
          sleep_quality: Number(sleepQuality),
          stress_level: Number(stressLevel),
          emotional_state: emotionalState,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPrediction(data.riskLevel);

        // ✅ Navigate to healthplan page
        navigate("/health-plan");
      } else {
        if (Array.isArray(data.detail)) {
          // FastAPI validation errors
          setError(data.detail.map(err => err.msg).join(", "));
        } else {
          setError(data.detail || "Something went wrong!");
        }
      }
    } catch (err) {
      setError("Failed to connect to backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="assessment-container">
      <ProfileIcon />
      <button className="back-btn" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Back
      </button>

      <div className="form-wrapper">
        <h2 className="form-title">Mental Health Assessment</h2>
        <form className="assessment-form" onSubmit={handleSubmit}>
          <label>Age</label>
          <input type="number" value={age} onChange={(e) => setAge(e.target.value)} required />

          <label>Gender</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)} required>
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <label>Mood Score (1-10)</label>
          <input type="number" min="1" max="10" value={moodScore} onChange={(e) => setMoodScore(e.target.value)} required />

          <label>Sleep Quality (1-10)</label>
          <input type="number" min="1" max="10" value={sleepQuality} onChange={(e) => setSleepQuality(e.target.value)} required />

          <label>Stress Level (1-10)</label>
          <input type="number" min="1" max="10" value={stressLevel} onChange={(e) => setStressLevel(e.target.value)} required />

          <label>Emotional State</label>
          <input type="text" value={emotionalState} onChange={(e) => setEmotionalState(e.target.value)} required />

          {/* ✅ Updated button style */}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Predicting..." : "Predict"}
          </button>
        </form>

        {prediction && (
          <div className="prediction-result">
            <h3>Predicted Risk Level: {prediction}</h3>
          </div>
        )}

        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  );
};

export default AssessmentPage;
