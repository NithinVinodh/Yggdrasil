import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const isHomePage = location.pathname === '/';

  if (!isHomePage) return null;

  return (
    <nav className="nav">
      <div className="nav-container">
        <div className="logo">MediClaim</div>
        <div className="nav-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            <FaHome className="nav-icon" />
            <span>Home</span>
          </Link>
          <Link to="/login" className={`nav-link ${isActive('/login') ? 'active' : ''}`}>
            <FaSignInAlt className="nav-icon" />
            <span>Login</span>
          </Link>
          <Link to="/signup" className={`nav-link ${isActive('/signup') ? 'active' : ''}`}>
            <FaUserPlus className="nav-icon" />
            <span>Sign Up</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
