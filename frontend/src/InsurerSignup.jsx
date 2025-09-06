import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaEnvelope,
  FaLock,
  FaBuilding,
  FaMapMarkerAlt,
  FaGlobe,
  FaPhone,
  FaCity,
} from "react-icons/fa";
import "./Home.css";

const InsurerSignup = () => {
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    password: "",
    contactNo: "",
    address: "",
    district: "",
    country: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (
      !formData.companyName ||
      !formData.email ||
      !formData.password ||
      !formData.contactNo ||
      !formData.address ||
      !formData.district ||
      !formData.country
    ) {
      setError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/insurer/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Signup failed");
      }

      const data = await response.json();
      console.log("Signup success:", data);

      // Store token if needed
      localStorage.setItem("token", data.access_token);

      // Redirect after successful signup
      navigate("/insurer-dashboard");
      
    } catch (err) {
      setError(err.message || "An error occurred during signup");
      console.error("Signup error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Styles (keeping your existing ones)
  const containerStyle = {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "radial-gradient(circle at top, #2a5a6f, #000000)",
    padding: "2rem",
  };

  const formStyle = {
    background: "rgba(42, 90, 111, 0.8)",
    padding: "2rem",
    borderRadius: "15px",
    maxWidth: "500px",
    width: "100%",
    color: "white",
  };

  const inputContainerStyle = {
    position: "relative",
    marginBottom: "1.5rem",
  };

  const inputStyle = {
    width: "100%",
    padding: "0.8rem 1rem 0.8rem 2.5rem",
    borderRadius: "8px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    background: "rgba(0, 0, 0, 0.2)",
    color: "white",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "0.5rem",
    fontWeight: "500",
  };

  const iconStyle = {
    position: "absolute",
    left: "1rem",
    top: "2.6rem",
    color: "rgba(255, 255, 255, 0.7)",
  };

  return (
    <div style={containerStyle}>
      <form onSubmit={handleSubmit} style={formStyle}>
        <h1 style={{ textAlign: "center", marginBottom: "1rem" }}>Insurer Signup</h1>

        {error && (
          <div style={{ color: "red", marginBottom: "1rem", textAlign: "center" }}>
            {error}
          </div>
        )}

        {/* Company Name */}
        <div style={inputContainerStyle}>
          <label style={labelStyle}>Company Name</label>
          <FaBuilding style={iconStyle} />
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="Enter your company name"
            style={inputStyle}
            required
          />
        </div>

        {/* Email */}
        <div style={inputContainerStyle}>
          <label style={labelStyle}>Email</label>
          <FaEnvelope style={iconStyle} />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            style={inputStyle}
            required
          />
        </div>

        {/* Password */}
        <div style={inputContainerStyle}>
          <label style={labelStyle}>Password</label>
          <FaLock style={iconStyle} />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            style={inputStyle}
            required
          />
        </div>

        {/* Contact No */}
        <div style={inputContainerStyle}>
          <label style={labelStyle}>Contact Number</label>
          <FaPhone style={iconStyle} />
          <input
            type="text"
            name="contactNo"
            value={formData.contactNo}
            onChange={handleChange}
            placeholder="Enter contact number"
            style={inputStyle}
            required
          />
        </div>

        {/* Address */}
        <div style={inputContainerStyle}>
          <label style={labelStyle}>Address</label>
          <FaMapMarkerAlt style={iconStyle} />
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter address"
            style={inputStyle}
            required
          />
        </div>

        {/* District */}
        <div style={inputContainerStyle}>
          <label style={labelStyle}>District</label>
          <FaCity style={iconStyle} />
          <input
            type="text"
            name="district"
            value={formData.district}
            onChange={handleChange}
            placeholder="Enter district"
            style={inputStyle}
            required
          />
        </div>

        {/* Country (changed to input box) */}
        <div style={inputContainerStyle}>
          <label style={labelStyle}>Country</label>
          <FaGlobe style={iconStyle} />
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="Enter country"
            style={inputStyle}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "1rem",
            borderRadius: "8px",
            backgroundColor: "#64b5f6",
            color: "white",
            border: "none",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: "pointer",
            marginTop: "1rem",
          }}
        >
          {isLoading ? "Creating Account..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
};

export default InsurerSignup;
