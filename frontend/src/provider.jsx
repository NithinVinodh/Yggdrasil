import React, { useState, useEffect } from "react";
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import ChatbotIcon from "./ChatbotIcon"; // ✅ Import chatbot
import "./provider.css";

const Providers = () => {
  const [providers, setProviders] = useState([]);
  const [applyLoading, setApplyLoading] = useState(null);
  const [patientInfo, setPatientInfo] = useState({ applnStatus: null, appliedInsurerId: null });

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const token = localStorage.getItem("token");
        const patientData = JSON.parse(localStorage.getItem("user"));

        if (!patientData || !patientData.id) {
          console.error("Patient ID is missing in localStorage");
          return;
        }

        setPatientInfo(patientData);

        const res = await fetch(
          `http://127.0.0.1:8000/patient/${patientData.id}/providers`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) throw new Error("Failed to fetch providers");

        const data = await res.json();
        setProviders(data);
      } catch (err) {
        console.error("Error fetching providers:", err);
      }
    };

    fetchProviders();
  }, []);

  const handleApply = async (insurerId) => {
    if (!insurerId || !patientInfo.id) {
      alert("Insurer or Patient ID is missing");
      return;
    }

    if (patientInfo.applnStatus === "pending") {
      alert("You already have a pending application.");
      return;
    }

    setApplyLoading(insurerId);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://127.0.0.1:8000/patient/apply/${insurerId}/${patientInfo.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to apply");

      setPatientInfo((prev) => ({
        ...prev,
        applnStatus: "pending",
        appliedInsurerId: insurerId,
      }));

      alert("Application sent successfully!");
    } catch (err) {
      console.error("Error applying:", err);
      alert(err.message || "Failed to apply");
    } finally {
      setApplyLoading(null);
    }
  };

  return (
    <div className="providers-page">
      <h1 className="title">Insurance Providers</h1>
      <p className="subtitle">
        Connect with trusted insurance providers to find the best coverage for your needs.
      </p>

      <div className="providers-grid">
        {providers.map((provider) => {
          const isApplied =
            patientInfo.applnStatus === "pending" &&
            patientInfo.appliedInsurerId === provider.id;
          const isLoading = applyLoading === provider.id;

          return (
            <div key={provider.id} className="provider-card">
              <div className="provider-header">
                <div className="avatar">{provider.companyName[0]}</div>
                <h2>{provider.companyName}</h2>
              </div>

              <div className="info">
                <p><FaPhone /> {provider.contactNo}</p>
                <p><FaEnvelope /> {provider.email}</p>
                <p><FaMapMarkerAlt /> {provider.address}, {provider.country}</p>
                <button
                  className="connect-btn"
                  onClick={() => handleApply(provider.id)}
                  disabled={isApplied || isLoading}
                >
                  {isLoading ? "Applying..." : isApplied ? "Pending" : "Apply"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <ChatbotIcon />
    </div>
  );
};

export default Providers;
