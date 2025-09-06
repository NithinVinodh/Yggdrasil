import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Upload.css";

const Upload = () => {
  const [file, setFile] = useState(null);
  const [fileURL, setFileURL] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setFileURL(URL.createObjectURL(uploadedFile));
      setAnalysis(null);
    }
  };

  const handleResult = async () => {
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    // ✅ Get user from localStorage
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.role === "patient") {
      formData.append("patient_id", user.id); // send patient_id
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Unsupported file format (upload file pdf , jpg and docx).");
      }

      const data = await response.json();
      setAnalysis(data); // backend returns patient_id, disease_name, suggestion
    } catch (error) {
      setAnalysis({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!analysis) return;
    const text = `
Patient ID: ${analysis.patient_id || ""}
Disease: ${analysis.disease_name || ""}
Suggestion: ${analysis.suggestion || ""}
    `;
    const element = document.createElement("a");
    const fileBlob = new Blob([text], { type: "text/plain" });
    element.href = URL.createObjectURL(fileBlob);
    element.download = "report.txt";
    element.click();
  };

  const handleNext = () => {
    navigate("/take-test");
  };

  return (
    <div className="signup-container">
      {/* Navbar */}
      <div>
        <button
          onClick={() => window.history.back()}
          style={{
            position: "fixed",
            top: "0.6rem",
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
      </div>

      {/* Form Container */}
      <div className="form-container">
        <h2 id="main-title">Upload Clinical Document</h2>
        <p id="main-slogan">Attach your file for preview and analysis</p>

        <input
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.png"
          onChange={handleFileChange}
          className="file-input"
        />

        {file && (
          <div className="preview-box">
            <h4>{file.name}</h4>

            {file.type === "application/pdf" ? (
              <embed
                src={fileURL}
                type="application/pdf"
                className="preview-pdf"
              />
            ) : file.type.startsWith("image/") ? (
              <img src={fileURL} alt="Preview" className="preview-img" />
            ) : (
              <p className="preview-unavailable">Preview not available</p>
            )}

            <button
              className="standard-button"
              onClick={handleResult}
              disabled={loading}
            >
              {loading ? "Analyzing..." : "Get Result"}
            </button>
          </div>
        )}

        {analysis && (
          <div className="result-container">
            {analysis.error ? (
              <p style={{ color: "red" }}>{analysis.error}</p>
            ) : (
              <>
                <p>
                  <strong>Disease:</strong> {analysis.disease_name || "N/A"}
                </p>
                <p>
                  <strong>Suggestion:</strong> {analysis.suggestion || "N/A"}
                </p>
              </>
            )}

            <div className="button-group">
              <button className="standard-button" onClick={handleDownload}>
                Download Report
              </button>
              <button className="standard-button" onClick={handleNext}>
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;
