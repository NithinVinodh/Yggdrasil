import "./PatientPanel.css";
import { useState, useEffect } from "react";
import InsurerIcon from "./components/InsurerIcon";
import axios from "axios";

function PatientPanel() {
  const [showCalendar, setShowCalendar] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        console.error("Error fetching applications:", err);
        setError("Failed to load applications.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const handleBookAppointment = (patient) => {
    setSelectedPatient(patient);
    setShowCalendar(true);
  };

  const handleConfirm = async () => {
    if (!appointmentDate || !appointmentTime) {
      alert("Please select both date and time!");
      return;
    }

    try {
      const dateTime = new Date(`${appointmentDate}T${appointmentTime}`).toISOString();
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found.");

      await axios.post(
        "http://localhost:8000/insurer/book-appointment",
        { application_id: selectedPatient.application_id, scheduled_datetime: dateTime },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPatients((prev) =>
        prev.map((p) =>
          p.application_id === selectedPatient.application_id
            ? { ...p, showBookBtn: false, apptStatus: "scheduled" }
            : p
        )
      );

      setShowCalendar(false);
      setShowPopup(true);
    } catch (err) {
      console.error("Error booking appointment:", err);
      alert("Failed to book appointment.");
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedPatient(null);
    setAppointmentDate("");
    setAppointmentTime("");
  };

  return (
    <div className="patient-container">
      <InsurerIcon />
      <button onClick={() => window.history.back()} className="back-btn">← Back</button>

      <div className="patient-panel">
        <h2 className="panel-title">Appointment Booking</h2>

        {loading && <p className="loading-text">Loading applications...</p>}
        {error && <p className="error-text">{error}</p>}
        {!loading && patients.length === 0 && <p>No applications found.</p>}

        {patients.length > 0 && (
          <table className="patient-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Mood Score</th>
                <th>Risk Level</th>
                <th>Schedule</th>
                <th>Appointments</th>
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
                  {/* Always show the status in Schedule column */}
                  <td className={patient.apptStatus === "pending" ? "status-pending" : "status-other"}>
                    {patient.apptStatus}
                  </td>
                  <td>
                    {/* Show Book Appointment button if allowed */}
                    {patient.showBookBtn ? (
                      <button className="book-btn" onClick={() => handleBookAppointment(patient)}>Book Appointment</button>
                    ) : (
                      <span className="scheduled-text">{patient.apptStatus}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Calendar Popup */}
      {showCalendar && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>Schedule Appointment</h3>
            <p>Select date and time for <strong>{selectedPatient?.name}</strong></p>

            <div className="calendar-fields">
              <label>Date:</label>
              <input type="date" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} />
              <label>Time:</label>
              <input type="time" value={appointmentTime} onChange={(e) => setAppointmentTime(e.target.value)} />
            </div>

            <div className="calendar-buttons">
              <button className="close-btn" onClick={() => setShowCalendar(false)}>Cancel</button>
              <button className="confirm-btn" onClick={handleConfirm}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Popup */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>Email Sent Successfully!</h3>
            <p>
              Appointment booked for <strong>{selectedPatient?.name}</strong><br/>
              Date: {appointmentDate}<br/>
              Time: {appointmentTime}
            </p>
            <button className="close-btn" onClick={closePopup}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientPanel;
