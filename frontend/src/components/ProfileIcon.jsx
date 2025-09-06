import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ Import useNavigate

// Styles are now included within the component file.
const ProfileIconStyles = () => (
  <style>{`
    /* --- Container and Positioning --- */
    .profile-icon-container {
      position: fixed;
      top: 1rem;
      right: 1.5rem;
      z-index: 1000;
    }

    /* --- Profile Icon Button --- */
    .profile-icon-button {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background-color: #007bff;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #ffffff;
      cursor: pointer;
      padding: 0;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: transform 0.2s ease-in-out, box-shadow 0.2s ease;
    }

    .profile-icon-button:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }

    /* --- Image and Initials --- */
    .profile-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .profile-initials {
      font-size: 1.2rem;
      font-weight: 600;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    /* --- Dropdown Menu --- */
    .profile-dropdown {
      position: absolute;
      top: 60px;
      right: 0;
      width: 180px;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 5px 25px rgba(0, 0, 0, 0.1);
      border: 1px solid #e9ecef;
      overflow: hidden;
      animation: fadeIn 0.2s ease-out;
    }

    .profile-dropdown ul {
      list-style: none;
      margin: 0;
      padding: 0.5rem 0;
    }

    .profile-dropdown li {
      padding: 0.8rem 1.2rem;
      font-size: 0.95rem;
      color: #343a40;
      cursor: pointer;
      transition: background-color 0.2s ease, color 0.2s ease;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .profile-dropdown li:hover {
      background-color: #f8f9fa;
      color: #0056b3;
    }

    /* --- Animation for dropdown --- */
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `}</style>
);

const ProfileIcon = ({ imageUrl, initials = 'U' }) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate(); // ✅ Initialize navigate

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsDropdownVisible((prev) => !prev);
  };

  // Navigate to Profile Page
  const handleViewProfile = () => {
    navigate('/UserProfile'); // ✅ Navigate to profile page
  };

  // Navigate to Login Page on Logout
  const handleLogout = () => {
    console.log("Logging out...");
    // Example: Clear auth tokens or user data
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <>
      <ProfileIconStyles />
      <div className="profile-icon-container" ref={dropdownRef}>
        <button
          className="profile-icon-button"
          onClick={toggleDropdown}
          aria-haspopup="true"
          aria-expanded={isDropdownVisible}
        >
          {imageUrl ? (
            <img src={imageUrl} alt="User Profile" className="profile-image" />
          ) : (
            <span className="profile-initials">{initials}</span>
          )}
        </button>

        {isDropdownVisible && (
          <div className="profile-dropdown">
            <ul>
              <li onClick={handleViewProfile}>View Profile</li>
              <li onClick={handleLogout}>Logout</li>
            </ul>
          </div>
        )}
      </div>
    </>
  );
};

export default ProfileIcon;
