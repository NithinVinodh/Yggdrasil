import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./InsurerProfile.css";
import userImage from "../src/assets/profile.jpg"; // adjust path if different


export default function InsurerProfile() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token"); // auth token

  const [insurer, setInsurer] = useState(null);
  const [editedInsurer, setEditedInsurer] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch insurer profile from backend
  useEffect(() => {
    const fetchInsurer = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/insurer/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Failed to fetch profile");

        setInsurer(data);
        setEditedInsurer(data);
        localStorage.setItem("insurerProfile", JSON.stringify(data));
      } catch (err) {
        console.error(err);
        alert("Error fetching insurer data");
      }
    };
    fetchInsurer();
  }, [token]);

  const handleBack = () => navigate(-1);

  const handleChange = (e) => {
    setEditedInsurer({ ...editedInsurer, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Only send changed fields
      const updatedFields = {};
      Object.keys(editedInsurer).forEach((key) => {
        if (editedInsurer[key] !== insurer[key]) updatedFields[key] = editedInsurer[key];
      });

      if (Object.keys(updatedFields).length === 0) {
        alert("No changes detected");
        setLoading(false);
        return;
      }

      const res = await fetch("http://127.0.0.1:8000/insurer/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedFields),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to update profile");

      setInsurer(data);
      setEditedInsurer(data);
      localStorage.setItem("insurerProfile", JSON.stringify(data));
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  if (!insurer) return <div className="in-profile-page">Loading...</div>;

  const editableFields = ["companyName", "contactNo", "address", "district", "country"];

  return (
    <div className="in-profile-page">
      {/* Back Button */}
      <button onClick={handleBack} className="back-btn">
        <FaArrowLeft /> Back
      </button>

      <div className="in-profile-card">
        <div className="in-profile-image-container">
        <img
  src={userImage}
  alt="Insurer"
  className="in-profile-image"
/>

          <button className="in-edit-btn" onClick={() => setIsEditing(!isEditing)}>
            <FaEdit />
          </button>
        </div>

        <div className="in-profile-details">

          <p>
            <strong>Email:</strong> {insurer.email || "N/A"}
          </p>

          {editableFields.map((field) => (
            <p key={field}>
              <strong>
                {field === "companyName" ? "Company Name" : field.charAt(0).toUpperCase() + field.slice(1)}:
              </strong>{" "}
              {isEditing ? (
                <input
                  type={field === "contactNo" ? "text" : "text"}
                  name={field}
                  value={editedInsurer[field] || ""}
                  onChange={handleChange}
                />
              ) : (
                insurer[field] || "N/A"
              )}
            </p>
          ))}

        </div>

        {isEditing && (
          <button className="in-save-btn" onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
        )}
      </div>
    </div>
  );
}
