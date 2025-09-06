import React, { useState } from 'react';
import './TakeTest.css';
import { useNavigate } from "react-router-dom";
import ProfileIcon from "./components/ProfileIcon";

const GAD7_QUESTIONS = [
  "Feeling nervous, anxious or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it is hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid as if something awful might happen",
  "Little interest or pleasure in doing things", 
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy", 
  "Poor appetite or overeating", 
  "Feeling bad about yourself or that you are a failure",
  "Trouble concentrating on things",
  "Moving or speaking so slowly that other people have noticed, or the opposite",
  "Thoughts that you would be better off dead or hurting yourself"
];

const ANSWER_OPTIONS = [
  { value: 0, label: "Not At All" },
  { value: 1, label: "Several Days" },
  { value: 2, label: "More Than Half The Days" },
  { value: 3, label: "Nearly Every Day" }
];

const TakeTest = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState('mode-selection');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Smart Back Button
  const handleBack = () => {
    if (currentStep === "mode-selection") navigate(-1);
    else if (currentStep === "testing") setCurrentStep("mode-selection");
    else if (currentStep === "results") setCurrentStep("testing");
  };

  const handleAnswerSelect = (value) => {
    setAnswers(prev => ({ ...prev, [currentQuestion]: value }));
  };

  const goToNextQuestion = () => {
    if (currentQuestion < GAD7_QUESTIONS.length - 1) setCurrentQuestion(prev => prev + 1);
    else setCurrentStep('results');
  };

  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) setCurrentQuestion(prev => prev - 1);
  };

  // --- SCORING ---
  const calculateTotalScore = () => Object.values(answers).reduce((sum, value) => sum + value, 0);

  const calculateDisplayScore = (totalScore) => {
    const maxScore = GAD7_QUESTIONS.length * 3; // 16*3=48
    return Math.round((totalScore / maxScore) * 10);
  };

  const getScoreInterpretation = (totalScore) => {
    if (totalScore <= 4) return { level: "Minimal", description: "Minimal anxiety symptoms", color: "#10b981" };
    if (totalScore <= 9) return { level: "Mild", description: "Mild anxiety symptoms", color: "#f59e0b" };
    if (totalScore <= 14) return { level: "Moderate", description: "Moderate anxiety symptoms", color: "#f97316" };
    return { level: "Severe", description: "Severe anxiety symptoms", color: "#ef4444" };
  };

  const resetTest = () => {
    setCurrentStep('mode-selection');
    setCurrentQuestion(0);
    setAnswers({});
  };

  const handleNext = async () => {
    setIsSaving(true);
    const totalScore = calculateTotalScore();
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://127.0.0.1:8000/patient/moodscore", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ moodscore: totalScore })
      });

      if (!res.ok) throw new Error("Failed to save mood score");

      const data = await res.json();
      console.log("Mood score saved:", data);

      const user = JSON.parse(localStorage.getItem("user"));
      const status = user?.status;

      if (status === "undiagnosed") {
        navigate("/provider");
      } else if (status === "undertreated") {
        navigate("/assessment");
      } else {
        console.warn("Unknown status:", status);
        alert("Unexpected status. Please contact support.");
      }

    } catch (err) {
      console.error("Error saving mood score:", err);
      alert("Could not save mood score. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // ---- UI ----
  const BackButton = () => (
    <button
      onClick={handleBack}
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
  );

  // ---- STEP RENDERING ----
  if (currentStep === 'mode-selection') {
    return (
      <div className="signup-container">
        <ProfileIcon/>
        <BackButton/>
        <div className="form-container">
          <h1 id="main-title">GAD-7 & PHQ-9 Assessment</h1>
          <p id="main-slogan">You will answer by clicking options</p>
          
          <button 
            className="standard-button"
            onClick={() => setCurrentStep('testing')}
          >
            Start Assessment
          </button>
        </div>
      </div>
    );
  }

  if (currentStep === 'testing') {
    return (
      <div className="signup-container">
        <BackButton/>
        <div className="form-container test-container">
          <div className="test-header">
            <div className="question-info">
              <h2 id="main-title">Question {currentQuestion + 1} of {GAD7_QUESTIONS.length}</h2>
              <div className="mode-indicator">Click Mode</div>
            </div>
            
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${((currentQuestion + 1) / GAD7_QUESTIONS.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="question-content">
            <h3 className="question-text">{GAD7_QUESTIONS[currentQuestion]}</h3>
            <p className="question-subtitle">
              Over the last 2 weeks, how often have you been bothered by this problem?
            </p>
          </div>

          <div className="answer-options">
            {ANSWER_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswerSelect(option.value)}
                className={`answer-option ${answers[currentQuestion] === option.value ? 'selected' : ''}`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="navigation-buttons">
            <button 
              onClick={goToPreviousQuestion}
              className={`nav-button prev-button ${currentQuestion === 0 ? 'disabled' : ''}`}
              disabled={currentQuestion === 0}
            >
              Previous
            </button>
            
            <button 
              onClick={goToNextQuestion}
              className={`nav-button next-button ${answers[currentQuestion] === undefined ? 'disabled' : ''}`}
              disabled={answers[currentQuestion] === undefined}
            >
              {currentQuestion === GAD7_QUESTIONS.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'results') {
    const totalScore = calculateTotalScore();      
    const displayScore = calculateDisplayScore(totalScore);
    const interpretation = getScoreInterpretation(totalScore);

    return (
      <div className="signup-container">
        <BackButton/>
        <div className="form-container results-container">
          <h1 id="main-title">Overall Results</h1>
          
          <div className="score-display">
            <div className="score-number">{displayScore} / 10</div>
            <div className="score-level" style={{ color: interpretation.color }}>
              {interpretation.level} Anxiety
            </div>
            <div className="score-description">{interpretation.description}</div>
          </div>

          <div className="score-breakdown">
            <h3>Score Breakdown:</h3>
            {GAD7_QUESTIONS.map((question, index) => (
              <div key={index} className="breakdown-row">
                <span className="question-number">Q{index + 1}</span>
                <span className="answer-label">{ANSWER_OPTIONS[answers[index]]?.label || 'Not answered'}</span>
                <span className="answer-score">{answers[index] || 0}</span>
              </div>
            ))}
          </div>

          <div className="disclaimer">
            <p>
              This is a screening tool, not a diagnosis. Please consult with a healthcare 
              professional for proper evaluation and treatment recommendations.
            </p>
          </div>

          <div className="results-actions">
            <button className="standard-button" onClick={resetTest}>Take Test Again</button>
            <button className="standard-button" onClick={handleNext} disabled={isSaving}>
              {isSaving ? "Saving..." : "Next"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default TakeTest;
