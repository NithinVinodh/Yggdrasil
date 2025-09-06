import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./Home.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const serviceType = new URLSearchParams(location.search).get("service") || "patient";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    const endpoint =
      serviceType === "patient"
        ? "http://127.0.0.1:8000/patient/login"
        : "http://127.0.0.1:8000/insurer/login";

    const payload = { email, password };
    console.log("Sending payload:", payload);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(data.detail || "Invalid credentials");
      }

      localStorage.setItem("token", data.access_token);
      localStorage.setItem(
        "user",
        JSON.stringify({ id: data.id, role: data.role, status: data.status })
      );

      if (data.role === "patient") {
        if (data.status === "undertreated") navigate("/upload");
        else navigate("/take-test");
      } else {
        navigate("/insurer-dashboard");
      }
    } catch (err) {
      setError(err.message);
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at top, #2a5a6f, #000000)",
        padding: "2rem",
      }}
    >
      <button onClick={() => navigate("/")} style={backButtonStyle}>
        ← Back to Home
      </button>

      <div style={{ width: "100%", maxWidth: "500px", padding: "0 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "3rem", fontWeight: "700", color: "white" }}>YggDrasil</h1>
          <p style={{ color: "rgba(255,255,255,0.9)" }}>Welcome back! Please login to continue</p>
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          {error && <div style={errorStyle}>{error}</div>}

          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={inputStyle}
              required
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={inputStyle}
              required
            />
          </div>

          <button type="submit" disabled={isLoading} style={buttonStyle(isLoading)}>
            {isLoading ? <Spinner /> : "Login"}
          </button>

          <p style={{ color: "rgba(255,255,255,0.7)", textAlign: "center", fontSize: "0.95rem" }}>
            Don't have an account?{" "}
            <Link to="/signup" style={{ color: "#64b5f6", fontWeight: "500", textDecoration: "none" }}>
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

// Styles
const backButtonStyle = {
  position: "fixed",
  top: "1.5rem",
  left: "1.5rem",
  background: "rgba(30,144,255,0.2)",
  border: "1px solid rgba(30,144,255,0.3)",
  color: "white",
  padding: "0.6rem 1.2rem",
  borderRadius: "30px",
  cursor: "pointer",
};

const formStyle = {
  background: "rgba(42, 90, 111, 0.8)",
  backdropFilter: "blur(10px)",
  padding: "2.5rem 2rem",
  borderRadius: "15px",
  width: "100%",
  boxSizing: "border-box",
};

const inputStyle = {
  width: "100%",
  padding: "0.8rem 1rem",
  borderRadius: "8px",
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(0,0,0,0.2)",
  color: "white",
  fontSize: "1rem",
  outline: "none",
};

const labelStyle = { color: "rgba(255,255,255,0.9)", fontSize: "0.95rem", marginBottom: "0.3rem", display: "block" };
const buttonStyle = (isLoading) => ({
  width: "100%",
  padding: "1rem",
  borderRadius: "8px",
  background: "linear-gradient(135deg, #1e90ff, #0d6efd)",
  color: "white",
  border: "none",
  fontSize: "1rem",
  fontWeight: "600",
  cursor: isLoading ? "not-allowed" : "pointer",
  margin: "2rem 0 1.5rem",
});
const errorStyle = { color: "#ff6b6b", backgroundColor: "rgba(255,107,107,0.1)", padding: "0.8rem", borderRadius: "8px", marginBottom: "1.5rem", textAlign: "center" };
const Spinner = () => <span style={{ display: "inline-block", width: "1rem", height: "1rem", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 1s linear infinite" }}></span>;

export default Login;
