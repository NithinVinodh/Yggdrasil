import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaMapMarkedAlt,
  FaVenusMars,
  FaHeartbeat,
  FaGlobe,
} from "react-icons/fa";

const PatientSignup = () => {
  // --- STATE MANAGEMENT ---
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    contactNo: "",
    email: "",
    password: "",
    address: "",
    district: "",
    country: "",
    status: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const genderOptions = ["Male", "Female", "Other"];
  const statusOptions = ["undertreated", "undiagnosed"];

  // --- HANDLERS ---
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

    if (
      !formData.name ||
      !formData.age ||
      !formData.gender ||
      !formData.contactNo ||
      !formData.email ||
      !formData.password ||
      !formData.address ||
      !formData.district ||
      !formData.country ||
      !formData.status
    ) {
      setError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/patient/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          age: parseInt(formData.age, 10),
          gender: formData.gender,
          contactNo: formData.contactNo,
          email: formData.email,
          password: formData.password,
          address: formData.address,
          district: formData.district,
          country: formData.country,
          // ✅ normalize status to lowercase
          status: formData.status.toLowerCase(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || "Signup failed. Please check your details."
        );
      }

      const data = await response.json();
      console.log("Patient signup successful:", data);

      localStorage.setItem("token", data.access_token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.id,
          role: data.role,
          status: data.status,
        })
      );

      if (data.status === "undertreated") {
        navigate("/upload");
      } else {
        navigate("/take-test");
      }
    } catch (err) {
      setError(err.message);
      console.error("Signup error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- STYLES ---
  const baseInputStyle = {
    width: "100%",
    padding: "0.8rem 1rem 0.8rem 2.5rem",
    borderRadius: "8px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    background: "rgba(0, 0, 0, 0.2)",
    color: "white",
    fontSize: "1rem",
    transition: "all 0.3s ease",
  };

  const styles = {
    inputContainer: {
      position: "relative",
      marginBottom: "1.5rem",
      width: "100%",
    },
    label: {
      display: "block",
      color: "rgba(255, 255, 255, 0.9)",
      marginBottom: "0.5rem",
      fontSize: "0.95rem",
      fontWeight: "500",
      textAlign: "left",
    },
    input: baseInputStyle,
    icon: {
      position: "absolute",
      left: "1rem",
      top: "calc(50% + 0.5rem)",
      transform: "translateY(-50%)",
      color: "rgba(255, 255, 255, 0.6)",
      pointerEvents: "none",
    },
    select: {
      ...baseInputStyle,
      paddingLeft: "2.5rem",
      appearance: "none",
      cursor: "pointer",
    },
    button: {
      width: "100%",
      padding: "1rem",
      borderRadius: "8px",
      background: "linear-gradient(135deg, #1e90ff, #0d6efd)",
      color: "white",
      border: "none",
      fontSize: "1rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      marginTop: "1rem",
      opacity: isLoading ? 0.8 : 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.75rem",
    },
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "radial-gradient(circle at top, #2a5a6f, #000000)",
        padding: "2rem",
      }}
    >
      <style>
        {`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>

      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            position: "fixed",
            top: "1.5rem",
            left: "1.5rem",
            background: "rgba(30, 144, 255, 0.2)",
            border: "1px solid rgba(30, 144, 255, 0.3)",
            color: "white",
            padding: "0.6rem 1.2rem",
            borderRadius: "30px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            transition: "all 0.3s ease",
            fontSize: "0.95rem",
            backdropFilter: "blur(10px)",
            zIndex: 1000,
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
          }}
        >
          ← Back
        </button>

        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "700",
              color: "white",
              marginBottom: "0.5rem",
              background: "linear-gradient(90deg, #1e90ff, #00bfff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              display: "inline-block",
            }}
          >
            Create Patient Account
          </h1>
          <p
            style={{
              color: "rgba(255, 255, 255, 0.8)",
              fontSize: "1rem",
              margin: 0,
            }}
          >
            Fill in your details to create an account
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            background: "rgba(42, 90, 111, 0.8)",
            backdropFilter: "blur(10px)",
            padding: "2.5rem 2rem",
            borderRadius: "15px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          {error && (
            <div
              style={{
                color: "#ff6b6b",
                backgroundColor: "rgba(255, 107, 107, 0.1)",
                padding: "0.8rem",
                borderRadius: "8px",
                marginBottom: "1.5rem",
                fontSize: "0.9rem",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          {/* --- FORM FIELDS --- */}
          {/* Full Name */}
          <div style={styles.inputContainer}>
            <label htmlFor="name" style={styles.label}>
              Full Name
            </label>
            <FaUser style={styles.icon} />
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              style={styles.input}
              required
            />
          </div>

          {/* Age + Gender */}
          <div style={{ display: "flex", gap: "1rem" }}>
            <div style={styles.inputContainer}>
              <label htmlFor="age" style={styles.label}>
                Age
              </label>
              <FaCalendarAlt style={styles.icon} />
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="Your age"
                style={styles.input}
                required
              />
            </div>
            <div style={styles.inputContainer}>
              <label htmlFor="gender" style={styles.label}>
                Gender
              </label>
              <FaVenusMars style={styles.icon} />
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                style={{
                  ...styles.select,
                  color: formData.gender ? "white" : "rgba(255,255,255,0.5)",
                }}
                required
              >
                <option value="">Select Gender</option>
                {genderOptions.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Contact Number */}
          <div style={styles.inputContainer}>
            <label htmlFor="contactNo" style={styles.label}>
              Contact Number
            </label>
            <FaPhone style={styles.icon} />
            <input
              type="tel"
              id="contactNo"
              name="contactNo"
              value={formData.contactNo}
              onChange={handleChange}
              placeholder="Enter your phone number"
              style={styles.input}
              required
            />
          </div>

          {/* Email */}
          <div style={styles.inputContainer}>
            <label htmlFor="email" style={styles.label}>
              Email Address
            </label>
            <FaEnvelope style={styles.icon} />
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              style={styles.input}
              required
            />
          </div>

          {/* Password */}
          <div style={styles.inputContainer}>
            <label htmlFor="password" style={styles.label}>
              Password
            </label>
            <FaLock style={styles.icon} />
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              style={styles.input}
              required
            />
          </div>

          {/* Address */}
          <div style={styles.inputContainer}>
            <label htmlFor="address" style={styles.label}>
              Street Address
            </label>
            <FaMapMarkerAlt style={styles.icon} />
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter your street address"
              style={styles.input}
              required
            />
          </div>

          {/* Country */}
          <div style={styles.inputContainer}>
            <label htmlFor="country" style={styles.label}>
              Country
            </label>
            <FaGlobe style={styles.icon} />
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="Enter your country"
              style={styles.input}
              required
            />
          </div>

          {/* District */}
          <div style={styles.inputContainer}>
            <label htmlFor="district" style={styles.label}>
              District / State
            </label>
            <FaMapMarkedAlt style={styles.icon} />
            <input
              type="text"
              id="district"
              name="district"
              value={formData.district}
              onChange={handleChange}
              placeholder="Enter your district or state"
              style={styles.input}
              required
            />
          </div>

          {/* Status */}
          <div style={styles.inputContainer}>
            <label htmlFor="status" style={styles.label}>
              Patient Status
            </label>
            <FaHeartbeat style={styles.icon} />
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={{
                ...styles.select,
                color: formData.status ? "white" : "rgba(255,255,255,0.5)",
              }}
              required
            >
              <option value="">Select Status</option>
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={isLoading} style={styles.button}>
            {isLoading ? (
              <>
                <span
                  style={{
                    display: "inline-block",
                    width: "1rem",
                    height: "1rem",
                    border: "2px solid rgba(255, 255, 255, 0.3)",
                    borderTopColor: "white",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                ></span>
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>

          <p
            style={{
              color: "rgba(255, 255, 255, 0.7)",
              textAlign: "center",
              fontSize: "0.95rem",
              margin: "1.5rem 0 0 0",
            }}
          >
            Already have an account?{" "}
            <a
              href="/login"
              style={{
                color: "#64b5f6",
                fontWeight: "500",
                textDecoration: "none",
              }}
            >
              Sign in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default PatientSignup;
