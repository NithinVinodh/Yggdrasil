import React, { useEffect, useState } from "react";
import { FaPhone, FaMapMarkerAlt, FaEnvelope } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ReactSpeedometer from "react-d3-speedometer";
import ChatbotIcon from "./ChatbotIcon";
import "./HealthPlan.css";

export default function HealthPlan() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [riskScore, setRiskScore] = useState({ value: 0, label: "Mood Score" });
  const [patientInfo, setPatientInfo] = useState({});
  const [suggestion, setSuggestion] = useState("");
  const [providers, setProviders] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [modalMsg, setModalMsg] = useState(""); // popup message

  const token = localStorage.getItem("token");

  // Fetch patient info and mood score
  useEffect(() => {
    async function fetchPatient() {
      const patientData = JSON.parse(localStorage.getItem("user")) || {};
      const patientId = patientData.id;

      if (!patientId) {
        setErrorMsg("Patient ID not found");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://127.0.0.1:8000/patient/patient/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.detail || "Failed to fetch patient info");
        }
        const data = await res.json();
        setPatientInfo(data);

        // Update speedometer using correct API field: moodscore
        let moodValue = Number(data.moodscore) || 0;
        moodValue = Math.min(Math.max(moodValue, 0), 100);
        setRiskScore({ value: moodValue, label: "Mood Score" });
      } catch (err) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPatient();
  }, [token]);

  // Fetch overall suggestions
// Fetch overall suggestions
const handleSuggestion = async () => {
  setErrorMsg("");
  setSuggestion("");
  setProviders([]);
  setBtnLoading(true);

  const userData = JSON.parse(localStorage.getItem("user")) || {};
  const patientId = userData.id;

  if (!patientId) {
    setErrorMsg("Patient ID not found");
    setBtnLoading(false);
    return;
  }

  try {
    const res = await fetch(
      `http://127.0.0.1:8000/careschedule/care/patient/overall/${patientId}`,
      {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        },
      }
    );

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.detail || "Failed to fetch suggestion and providers");
    }

    const data = await res.json();

    // Format suggestion
    const formattedSuggestion = data.suggestion
      .split("\n")
      .filter(line => line.trim() !== "")
      .map((line, idx) => (
        <p key={idx} style={{ marginBottom: "1em", lineHeight: "1.5em" }}>
          {line.trim()}
        </p>
      ));

    setSuggestion(formattedSuggestion);
    setProviders(data.providers || []);
    setPatientInfo(data.patientInfo);

    // Update speedometer
    if (data.patientInfo?.moodScore !== undefined) {
      let moodValue = Number(data.patientInfo.moodScore) || 0;
      moodValue = Math.min(Math.max(moodValue, 0), 100);
      setRiskScore({ value: moodValue, label: "Mood Score" });
    }

  } catch (err) {
    setErrorMsg(err.message);
  } finally {
    setBtnLoading(false);
  }
};


  // Apply to insurer
  const handleApply = async (insurerId) => {
    if (!insurerId || !patientInfo.id) {
      setModalMsg("Insurer or Patient ID not found.");
      return;
    }

    setApplyLoading(insurerId); // Track which provider is being applied
    setModalMsg(""); // reset popup

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/patient/patient/apply/${insurerId}/${patientInfo.id}`,
        {
          method: "POST",
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ patientId: patientInfo.id })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        if (data.detail) alert(data.detail);
        throw new Error(data.detail || "Failed to apply");
      }

      setPatientInfo({ ...patientInfo, applnStatus: "pending", appliedInsurerId: insurerId });
      setModalMsg(`Application sent to ${data.insurer_name} successfully!`);
    } catch (err) {
      console.error(err);
      if (!err.message.includes("already have a pending")) setModalMsg(err.message);
    } finally {
      setApplyLoading(null);
    }
  };

  // Determine segment colors based on mood score
  const getSegmentColors = (value) => {
    if (value <= 40) return ["#00b894", "#00b894", "#00b894"]; // low mood → red
    if (value <= 70) return ["#fdcb6e", "#fdcb6e", "#00b894"]; // medium → yellow/orange
    return ["#d63031", "#fd6e6e", "#fd6e6e"]; // high → green
  };
  

  return (
    <div className="suggestion-page">
      <button onClick={() => navigate(-1)} className="back-btn">← Back</button>
      <h2 className="page-title">Result Analysis</h2>

      {errorMsg && <div className="error-box">{errorMsg}</div>}
      {modalMsg && <div className="modal-popup">{modalMsg}</div>}

      <div className="risk-score-card">
        <h3>{riskScore.label}</h3>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <ReactSpeedometer
            value={riskScore.value}
            minValue={0}
            maxValue={100}
            segments={3}
            segmentColors={getSegmentColors(riskScore.value)}
            needleColor="steelblue"
            textColor="white"
            currentValueText={`${riskScore.value} / 100`}
          />
        )}
      </div>

      <div className="grid-cards">
        <div className="mini-card">Age: {patientInfo.age || "-"}</div>
        <div className="mini-card">Gender: {patientInfo.gender || "-"}</div>
        <div className="mini-card">Disease: {patientInfo.diseaseName || "-"}</div>
        <div className="mini-card">Risk Level: {patientInfo.riskLevel || "-"}</div>
      </div>

      <button
        className="suggest-btn"
        onClick={handleSuggestion}
        disabled={btnLoading}
      >
        {btnLoading ? "Generating..." : "Get Overall Suggestion"}
      </button>

      {suggestion && <div className="suggestion-box">{suggestion}</div>}

      {providers.length > 0 && (
        <div className="consultants-section">
          <h3>Available Insurance Providers</h3>
          <div className="consultant-grid">
            {providers.map((p) => {
              const isApplied =
                patientInfo.applnStatus === "pending" &&
                patientInfo.appliedInsurerId === p.id;
              const isLoading = applyLoading === p.id;

              return (
                <div className="consultant-card" key={p.id}>
                  <p><strong>{p.companyName}</strong></p>
                  <p><FaPhone /> {p.contactNo}</p>
                  <p><FaEnvelope /> {p.email}</p>
                  <p><FaMapMarkerAlt /> {p.address}</p>
                  <p>Country: {p.country}</p>
                  <button
                    className="connect-btn"
                    onClick={() => handleApply(p.id)}
                    disabled={isApplied || isLoading}
                  >
                    {isLoading ? "Applying..." : isApplied ? "Pending" : "Apply"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <ChatbotIcon />
    </div>
  );
}
