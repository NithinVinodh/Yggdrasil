import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./UserProfile.css";

export default function UserProfile() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [user, setUser] = useState(null); // full user from backend
  const [editedUser, setEditedUser] = useState({}); // temporary for edits
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch user profile from backend
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/patient/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Failed to fetch profile");

        setUser(data);
        setEditedUser(data); // initialize editable form
        localStorage.setItem("userProfile", JSON.stringify(data));
      } catch (err) {
        console.error(err);
        alert("Error fetching user data");
      }
    };
    fetchUser();
  }, [token]);

  const handleBack = () => navigate(-1);

  const handleChange = (e) => {
    setEditedUser({ ...editedUser, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Only send fields that changed
      const updatedFields = {};
      Object.keys(editedUser).forEach((key) => {
        if (editedUser[key] !== user[key]) updatedFields[key] = editedUser[key];
      });

      if (Object.keys(updatedFields).length === 0) {
        alert("No changes detected");
        setLoading(false);
        return;
      }

      const res = await fetch("http://127.0.0.1:8000/patient/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedFields),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to update profile");

      setUser(data); // update state with latest backend data
      setEditedUser(data);
      localStorage.setItem("userProfile", JSON.stringify(data));
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div>Loading...</div>;

  const fields = ["name", "age", "gender", "district", "country", "status"];

  return (
    <div className="profile-page">
      <button onClick={handleBack} className="back-btn">
        <FaArrowLeft /> Back
      </button>

      <div className="profile-card">
        <div className="profile-image-container">
          <img
            src="https://www.perfocal.com/blog/content/images/2021/01/Perfocal_17-11-2019_TYWFAQ_100_standard-3.jpg"
            alt="User"
            className="profile-image"
          />
          <button className="edit-btn" onClick={() => setIsEditing(!isEditing)}>
            <FaEdit />
          </button>
        </div>

  <div className="profile-details">
  {["name", "age", "gender", "district", "country", "status"].map((field) => (
    <p key={field}>
      <strong>{field.charAt(0).toUpperCase() + field.slice(1)}:</strong>{" "}
      {isEditing && field !== "status" ? ( // make status read-only
        <input
          type={field === "age" ? "number" : "text"}
          name={field}
          value={editedUser[field] || ""}
          onChange={handleChange}
        />
      ) : (
        user[field] // just display status as text
      )}
    </p>
  ))}
</div>


        {isEditing && (
          <button className="save-btn" onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
        )}
      </div>
    </div>
  );
}
