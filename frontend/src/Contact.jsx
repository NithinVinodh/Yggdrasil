import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="home-container">
      <div className="section" id="contact">
        <div className="content-container">
          <h1 className="section-title">Contact Us</h1>
          <div className="about-content">
            <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="name" style={{ display: 'block', marginBottom: '8px', color: '#e0e0e0' }}>Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', color: '#e0e0e0' }}>Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '25px' }}>
                <label htmlFor="message" style={{ display: 'block', marginBottom: '8px', color: '#e0e0e0' }}>Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    fontSize: '1rem',
                    resize: 'vertical',
                    minHeight: '120px'
                  }}
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                className="get-started-btn"
                style={{ 
                  display: 'block',
                  margin: '0 auto',
                  cursor: 'pointer',
                  border: 'none'
                }}
              >
                Send Message
              </button>
            </form>
            
            <div style={{ marginTop: '40px', textAlign: 'center' }}>
              <p style={{ color: '#e0e0e0', marginBottom: '20px' }}>Or reach us directly at:</p>
              <p style={{ color: '#1e90ff', marginBottom: '10px' }}>Email: info@healthcareportal.com</p>
              <p style={{ color: '#1e90ff' }}>Phone: +1 (555) 123-4567</p>
              
              <div style={{ marginTop: '40px' }}>
                <Link to="/about" className="card-get-started-btn" style={{ display: 'inline-flex' }}>
                  Learn More About Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
