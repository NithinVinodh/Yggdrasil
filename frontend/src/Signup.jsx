import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUserInjured, FaBuilding, FaArrowLeft } from 'react-icons/fa';
import './Home.css';

const Signup = () => {
  const [userType, setUserType] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the user type from URL params if provided
  const searchParams = new URLSearchParams(location.search);
  const typeFromUrl = searchParams.get('type');
  
  // If type is provided in URL, set it
  React.useEffect(() => {
    if (typeFromUrl && ['patient', 'insurer'].includes(typeFromUrl)) {
      setUserType(typeFromUrl);
    }
  }, [typeFromUrl]);

  const handleContinue = () => {
    if (userType === 'patient') {
      // Navigate to patient signup form
      navigate('/signup/patient');
    } else if (userType === 'insurer') {
      // Navigate to insurer signup form
      navigate('/signup/insurer');
    } else {
      setError('Please select an account type');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'radial-gradient(circle at top, #2a5a6f, #000000)',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
      margin: 0
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 0',
        position: 'relative',
        zIndex: 1,
        textAlign: 'center'
      }}>
        <button 
          onClick={() => navigate(-1)}
          style={{
            position: 'fixed',
            top: '1.5rem',
            left: '1.5rem',
            background: 'rgba(30, 144, 255, 0.2)',
            border: '1px solid rgba(30, 144, 255, 0.3)',
            color: 'white',
            padding: '0.6rem 1.2rem',
            borderRadius: '30px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.3s ease',
            fontSize: '0.95rem',
            backdropFilter: 'blur(10px)',
            zIndex: 1000,
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
          }}
          onMouseOver={(e) => {
            e.target.style.background = 'rgba(30, 144, 255, 0.3)';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'rgba(30, 144, 255, 0.2)';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
          }}
        >
          ← Back
        </button>

        <h1 id="main-title" >Create an Account</h1>
        <p id="main-slogan" style={{ marginBottom: '2rem', color: 'rgba(255, 255, 255, 0.9)' }}>
          Select your account type to get started
        </p>
        
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '2rem',
          width: '100%',
          maxWidth: '800px',
          margin: '0 auto 2rem',
          padding: '0 1rem'
        }}>
          {/* Patient Card */}
          <div 
            onClick={() => setUserType('patient')}
            style={{
              flex: '1',
              minWidth: '280px',
              maxWidth: '380px',
              background: userType === 'patient' 
                ? 'rgba(30, 144, 255, 0.1)' 
                : 'rgba(255, 255, 255, 0.05)',
              border: userType === 'patient'
                ? '2px solid #1e90ff'
                : '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '15px',
              padding: '2.5rem 2rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'center',
              transform: userType === 'patient' ? 'translateY(-5px)' : 'none',
              boxShadow: userType === 'patient' 
                ? '0 10px 20px rgba(30, 144, 255, 0.2)' 
                : 'none'
            }}
            onMouseOver={(e) => {
              if (userType !== 'patient') {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(30, 144, 255, 0.1)';
              }
            }}
            onMouseOut={(e) => {
              if (userType !== 'patient') {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(30, 144, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              fontSize: '2rem',
              color: '#1e90ff'
            }}>
              <FaUserInjured />
            </div>
            <h3 style={{
              color: 'white',
              marginBottom: '1rem',
              fontSize: '1.3rem',
              fontWeight: '600'
            }}>
              I'm a Patient
            </h3>
            <p style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.95rem',
              lineHeight: '1.5',
              margin: 0
            }}>
              Sign up to access personalized healthcare services and manage your medical needs.
            </p>
          </div>
          
          {/* Insurer Card */}
          <div 
            onClick={() => setUserType('insurer')}
            style={{
              flex: '1',
              minWidth: '280px',
              maxWidth: '380px',
              background: userType === 'insurer' 
                ? 'rgba(30, 144, 255, 0.1)' 
                : 'rgba(255, 255, 255, 0.05)',
              border: userType === 'insurer'
                ? '2px solid #1e90ff'
                : '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '15px',
              padding: '2.5rem 2rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'center',
              transform: userType === 'insurer' ? 'translateY(-5px)' : 'none',
              boxShadow: userType === 'insurer' 
                ? '0 10px 20px rgba(30, 144, 255, 0.2)' 
                : 'none'
            }}
            onMouseOver={(e) => {
              if (userType !== 'insurer') {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(30, 144, 255, 0.1)';
              }
            }}
            onMouseOut={(e) => {
              if (userType !== 'insurer') {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(30, 144, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              fontSize: '2rem',
              color: '#1e90ff'
            }}>
              <FaBuilding />
            </div>
            <h3 style={{
              color: 'white',
              marginBottom: '1rem',
              fontSize: '1.3rem',
              fontWeight: '600'
            }}>
              I'm an Insurer
            </h3>
            <p style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.95rem',
              lineHeight: '1.5',
              margin: 0
            }}>
              Sign up to access insurer dashboard and manage insurance services.
            </p>
          </div>
        </div>
        
        <button
          onClick={handleContinue}
          disabled={!userType}
          style={{
            background: userType 
              ? 'linear-gradient(135deg, #1e90ff, #0d6efd)' 
              : 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            border: 'none',
            padding: '1rem 3rem',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: userType ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s ease',
            marginTop: '1rem',
            opacity: userType ? 1 : 0.7,
            transform: userType ? 'none' : 'none',
            boxShadow: userType ? '0 4px 15px rgba(30, 144, 255, 0.3)' : 'none'
          }}
          onMouseOver={(e) => {
            if (userType) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(30, 144, 255, 0.4)';
            }
          }}
          onMouseOut={(e) => {
            if (userType) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(30, 144, 255, 0.3)';
            }
          }}
        >
          Continue as {userType || '...'}
        </button>
        
        {error && (
          <div style={{
            color: '#ff6b6b',
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            padding: '0.8rem 1.5rem',
            borderRadius: '8px',
            marginTop: '1.5rem',
            fontSize: '0.95rem',
            maxWidth: '400px',
            width: '100%'
          }}>
            {error}
          </div>
        )}
        
        <p style={{
          color: 'rgba(255, 255, 255, 0.6)',
          marginTop: '2rem',
          fontSize: '0.95rem'
        }}>
          Already have an account?{' '}
          <button 
            onClick={() => navigate('/login')}
            style={{
              background: 'none',
              border: 'none',
              color: '#64b5f6',
              cursor: 'pointer',
              fontWeight: '500',
              padding: '0.2rem 0.4rem',
              borderRadius: '4px',
              fontSize: '0.95rem',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.textDecoration = 'underline';
            }}
            onMouseOut={(e) => {
              e.target.textDecoration = 'none';
            }}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signup;
