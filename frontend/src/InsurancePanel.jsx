import InsurerIcon from "./components/InsurerIcon";
import "./InsurancePanel.css";
import { useState, useEffect } from "react";
import axios from "axios";

function InsurancePanel() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [actionPopup, setActionPopup] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication token not found.");

        const response = await axios.get(
          "http://localhost:8000/insurer/patient-applications",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setPatients(response.data);
      } catch (err) {
        console.error("Error fetching patient applications:", err);
        setError("Failed to load patient applications.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const handleAction = async (applicationId, patientName, actionType) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found.");

      const status = actionType === "Accept" ? "accepted" : "declined";

      await axios.put(
        `http://localhost:8000/insurer/application/${applicationId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPatients((prev) =>
        prev.filter((p) => p.application_id !== applicationId)
      );

      setActionMessage(
        actionType === "Accept"
          ? `You approved the insurance application for ${patientName}. Email sent.`
          : `You declined the insurance application for ${patientName}. Email sent.`
      );
      setActionPopup(true);
    } catch (err) {
      console.error(`Error ${actionType.toLowerCase()}ing application:`, err);
      alert(`Failed to ${actionType.toLowerCase()} application.`);
    }
  };

  const closePopup = () => {
    setActionPopup(false);
    setActionMessage("");
  };

  return (
    <div className="insurance-container">
      <InsurerIcon />
      <button onClick={() => window.history.back()} className="back-btn">
        ← Back
      </button>

      <div className="insurance-panel">
        <h2 className="panel-title">Insurance Approvals</h2>

        {loading ? (
          <p className="loading-text">Loading applications...</p>
        ) : error ? (
          <p className="error-text">{error}</p>
        ) : patients.length === 0 ? (
          <p>No pending applications</p>
        ) : (
          <table className="insurance-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Mood Score</th>
                <th>Risk Level</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.application_id}>
                  <td>{patient.name}</td>
                  <td>{patient.age}</td>
                  <td>{patient.gender}</td>
                  <td>{patient.moodScore ?? "—"}</td>
                  <td>{patient.riskLevel}</td>
                  <td
                    className={
                      patient.applnStatus === "pending"
                        ? "status-pending"
                        : "status-other"
                    }
                  >
                    {patient.applnStatus}
                  </td>
                  <td>
                    {patient.applnStatus === "pending" ? (
                      <>
                        <button
                          className="accept-btn"
                          onClick={() =>
                            handleAction(
                              patient.application_id,
                              patient.name,
                              "Accept"
                            )
                          }
                        >
                          Accept
                        </button>
                        <button
                          className="reject-btn"
                          onClick={() =>
                            handleAction(
                              patient.application_id,
                              patient.name,
                              "Reject"
                            )
                          }
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {actionPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <div className="popup-icon">
              {actionMessage.toLowerCase().includes("approved") ? "✅" : "📝"}
            </div>
            <h3>
              {actionMessage.toLowerCase().includes("approved")
                ? "Application Approved"
                : "Application Declined"}
            </h3>
            <p>{actionMessage}</p>
            <button className="close-btn" onClick={closePopup}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default InsurancePanel;
