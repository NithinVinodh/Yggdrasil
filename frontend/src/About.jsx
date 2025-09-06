import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const About = () => {
  return (
    <div className="home-container">
      <div className="section" id="about">
        <div className="content-container">
          <h1 className="section-title">About Us</h1>
          <div className="about-content">
            <p>
              We are a dedicated team of healthcare and technology professionals committed to 
              revolutionizing the healthcare insurance industry. Our mission is to make healthcare 
              more accessible and transparent for everyone.
            </p>
            <div className="crisp-content">
              <h3>Our Vision</h3>
              <p>
                To create a seamless connection between patients, healthcare providers, and insurers, 
                ensuring everyone has access to quality healthcare services without unnecessary 
                complications or delays.
              </p>
            </div>
            <div className="get-started-container">
              <Link to="/contact" className="get-started-btn">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
