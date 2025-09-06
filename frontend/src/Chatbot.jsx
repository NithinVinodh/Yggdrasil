import React, { useState, useRef } from "react";
import {
  FaPaperPlane,
  FaRobot,
  FaPaperclip,
  FaImage,
  FaCamera,
  FaMapMarkerAlt,
  FaFileAlt,
  FaCalendarAlt,
  FaTimes
} from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DOMPurify from "dompurify";
import "./Chatbot.css";

export default function Chatbot({ onClose }) {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello 👋, I’m here to support you. How are you feeling today?"}
  ]);
  const [input, setInput] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(false);

  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const docInputRef = useRef(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const cleanInput = DOMPurify.sanitize(input);

    // Show user message immediately
    setMessages([...messages, { sender: "user", text: cleanInput }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: cleanInput }),
      });

      const data = await res.json();
      const botText = data.bot;

      // Append bot reply with detected emotion
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: botText },
      ]);
    } catch (err) {
      console.error("Error connecting to backend:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Sorry, I couldn’t reach the server.", emotion: "neutral" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, type) => {
    if (e.target.files && e.target.files[0]) {
      const cleanFileName = DOMPurify.sanitize(e.target.files[0].name);
      setMessages([
        ...messages,
        { sender: "user", text: `${type} uploaded: ${cleanFileName}` }
      ]);
    }
  };

  const handleLocation = () => {
    alert("Please turn on your location 📍");
    setShowOptions(false);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    const cleanDate = DOMPurify.sanitize(date.toLocaleDateString());

    setMessages([
      ...messages,
      { sender: "user", text: `Event scheduled on ${cleanDate}` }
    ]);
    setShowDatePicker(false);
  };

  return (
    <div className="chatbot-inner">
      <div className="chat-header">
        <FaRobot className="chatbot-icon" />
        <span>YggDrasil.ai Support</span>
        <FaTimes className="chat-close" onClick={onClose} />
      </div>

      <div className="chat-body">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`chat-message ${msg.sender === "user" ? "user" : "bot"}`}
          >
            <div>{msg.text}</div>
            
          </div>
        ))}

        {loading && <div className="chat-message bot">⏳ Typing...</div>}

        {showDatePicker && (
          <div className="date-picker-popup">
            <DatePicker
              selected={selectedDate}
              onChange={handleDateSelect}
              inline
            />
          </div>
        )}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />

        <div className="attach-container">
          <FaPaperclip
            className="attach-icon"
            onClick={() => setShowOptions(!showOptions)}
          />
          {showOptions && (
            <div className="attach-options">
              <div onClick={() => galleryInputRef.current.click()}>
                <FaImage /> Gallery
              </div>
              <div onClick={() => cameraInputRef.current.click()}>
                <FaCamera /> Camera
              </div>
              <div onClick={handleLocation}>
                <FaMapMarkerAlt /> Location
              </div>
              <div onClick={() => docInputRef.current.click()}>
                <FaFileAlt /> Document
              </div>
              <div onClick={() => setShowDatePicker(!showDatePicker)}>
                <FaCalendarAlt /> Schedule
              </div>
            </div>
          )}
        </div>

        <button onClick={handleSend}>
          <FaPaperPlane />
        </button>
      </div>

      {/* Hidden inputs */}
      <input
        type="file"
        accept="image/*"
        ref={galleryInputRef}
        style={{ display: "none" }}
        onChange={(e) => handleFileChange(e, "Image")}
      />
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={cameraInputRef}
        style={{ display: "none" }}
        onChange={(e) => handleFileChange(e, "Camera")}
      />
      <input
        type="file"
        ref={docInputRef}
        style={{ display: "none" }}
        onChange={(e) => handleFileChange(e, "Document")}
      />
    </div>
  );
}
