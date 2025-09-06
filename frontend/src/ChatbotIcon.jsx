import React, { useState } from "react";
import Chatbot from "./Chatbot";
import { FaComments, FaRobot } from "react-icons/fa";
import "./Chatbot.css";

const ChatbotIcon = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="chatbot-wrapper">
      {/* Floating button (only visible when chatbot is closed) */}
      {!open && (
        <button className="chatbot-launch-btn" onClick={() => setOpen(true)}>
          <FaRobot size={28} />
        </button>
      )}

      {/* Chatbot container */}
      {open && (
        <div className={`chatbot-container active`}>
          <Chatbot onClose={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
};

export default ChatbotIcon;
