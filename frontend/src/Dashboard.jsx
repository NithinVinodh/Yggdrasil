import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import InsurerIcon from './components/InsurerIcon';

function Dashboard() {
  const navigate = useNavigate();
  const [userDistrict, setUserDistrict] = useState('New York'); // Default fallback
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    total_providers: 0,
    patients_in_district: 0,
    status: 'Loading...',
    note: 'Loading statistics...',
    is_adequate: true,
  });

  const handleBack = () => {
    navigate("/InsuranceHome");
  };

  const goToPatientPanel = () => {
    navigate("/patient-panel");
  };

  const goToInsurancePanel = () => {
    navigate("/insurance-panel");
  };

  // ✅ Fetch Dashboard Stats
  const fetchDashboardStats = async (district, token) => {
    try {
      const statsResponse = await fetch(
        `http://127.0.0.1:8000/dashboard/stats?district=${encodeURIComponent(district)}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        console.log("Fetched dashboard stats:", stats);
        setDashboardStats(stats);
      } else {
        console.error("Failed to fetch dashboard stats");
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    }
  };

  // ✅ Fetch User Profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user"));

        if (!token || !user) {
          console.error("No token or user data found");
          setLoading(false);
          return;
        }

        const endpoint =
          user.role === "insurer"
            ? `http://127.0.0.1:8000/insurer/profile`
            : `http://127.0.0.1:8000/patient/${user.id}`;

        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const userData = await response.json();
          console.log("Fetched user data:", userData);

          if (userData.district) {
            setUserDistrict(userData.district);
            await fetchDashboardStats(userData.district, token);
          } else {
            console.log("No district found in user data");
          }
        } else {
          console.error("Failed to fetch user profile, status:", response.status);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <div className="dashboard-wrapper">
      <InsurerIcon />

      {/* Navbar */}
      <nav className="dashboard-navbar">
        <div className="navbar-left">
          <h2 className="navbar-title">Dashboard</h2>
        </div>

        <div className="navbar-center">
          <button onClick={goToPatientPanel} className="navbar-btn">
            Patient Panel
          </button>
          <button onClick={goToInsurancePanel} className="navbar-btn">
            Insurance Panel
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="dashboard-container">
        <button onClick={handleBack} className="back-btn">← Back</button>

        {/* Left Section - Map */}
        <div className="dashboard-left">
          <div className="map-container">
            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", fontSize: "18px" }}>
                Loading map...
              </div>
            ) : (
              <iframe
                title="Map"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(userDistrict)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
              ></iframe>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="dashboard-right">
          <div className="card-section">
            <div className="dashboard-card">
              <h3>{dashboardStats.total_providers}</h3>
              <h4>Total Healthcare providers</h4>
            </div>
            <div className="dashboard-card">
              <h3>{dashboardStats.patients_in_district}</h3>
              <h4>Total Patients</h4>
            </div>
            <div className="dashboard-card">
              <h3 style={{ color: dashboardStats.is_adequate ? "#28a745" : "#dc3545" }}>
                {dashboardStats.status}
              </h3>
              <h4>Status</h4>
            </div>
          </div>

          {/* Note Container */}
          <div className="note-container">
            <h2>Note</h2>
            <p>{dashboardStats.note}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
