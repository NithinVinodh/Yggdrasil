import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navigate = useNavigate();

  const handleGetStarted = (serviceType) => {
    navigate(`/login?service=${serviceType}`);
  };

  return (
    <div className="home-container">
      {/* Fixed Navigation Bar */}
      <nav className="home-navbar">
        <div className="home-nav-links">
          <a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>
            Home
          </a>
          <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>
            About Us
          </a>
          <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>
            Contact Us
          </a>
        </div>
      </nav>

      {/* Home Section */}
      <section id="home" className="section">
        <div className="content-container" style={{ textAlign: 'center' }}>
          <h1 className="section-title" style={{ 
            fontSize: '5.5rem',
            marginBottom: '1.5rem',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
          }}>
            YggDrasil.ai
          </h1>
          <h2 style={{ 
            fontSize: '3.5rem',
            fontWeight: '400',
            margin: '0',
            lineHeight: '1.4',
            color: 'white',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
            letterSpacing: '0.5px'
          }}>
            The Tree of Life, <br />the Axis of Everything.
          </h2>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="section">
        <div className="content-container">
          <h2 className="section-title">About Us</h2>
          <div className="about-content">
            <p>
              YggDrasil.ai is a personalized AI companion that supports your daily tasks, 
              provides emotional care, and engages in meaningful conversations. With empathy 
              and intelligence at its core, it adapts to your needs and connects through chat,
              voice so you can interact in the way that feels most natural.
            </p>
            
            {/* Service Cards */}
            <div className="service-cards">
              <div className="service-card">
                <h3>Patient Service</h3>
                <p>
                  Comprehensive AI-driven healthcare support designed to assist patients with 
                  personalized care and guidance throughout their medical journey.
                </p>
                <div className="card-button-container">
                  <button
                    className="card-get-started-btn"
                    onClick={() => handleGetStarted("patient")}
                  >
                    Get Started
                    <span className="arrow-icon">→</span>
                  </button>
                </div>
              </div>
              
              <div className="service-card">
                <h3>Insurer Service</h3>
                <p>
                  Advanced AI solutions for insurance companies to streamline operations, reduce 
                  costs, and enhance customer satisfaction with intelligent automation.
                </p>
                <div className="card-button-container">
                  <button
                    className="card-get-started-btn"
                    onClick={() => handleGetStarted("insurer")}
                  >
                    Get Started
                    <span className="arrow-icon">→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="section">
        <div className="content-container">
          <h2 className="section-title">Contact Us</h2>
          <div className="contact-content">
            <div className="contact-info">
              <div className="contact-item">
                <h3>Email</h3>
                <p>support@yggdrasil.com</p>
              </div>
              <div className="contact-item">
                <h3>Phone</h3>
                <p>+123 456 7890</p>
              </div>
              <div className="contact-item">
                <h3>Address</h3>
                <p>123 AI Street, Tech City, TC 12345</p>
              </div>
            </div>
            <form className="contact-form">
              <input type="text" placeholder="Your Name" required />
              <input type="email" placeholder="Your Email" required />
              <textarea placeholder="Your Message" rows="5" required></textarea>
              <button type="submit">Send Message</button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>YggDrasil.ai</h3>
            <p>Your AI companion for a better tomorrow</p>
          </div>
          
          <div className="social-media">
            <h4>Follow Us</h4>
            <div className="social-icons">
              {/* Social icons remain the same */}
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2025 YggDrasil. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
