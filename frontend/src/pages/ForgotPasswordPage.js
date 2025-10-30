import React, { useState } from 'react';
import ForgotPassword from '../components/ForgotPassword';
import SuccessMessage from '../components/SuccessMessage';
//import ErrorMessage from '../components/ErrorMessage';

const ForgotPasswordPage = ({ onNavigate }) => {
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const handleEmailSubmit = async (email) => {
    try {
      setError('');
      setUserEmail(email);
      
      console.log('🔄 Sending password reset request for:', email);
      
      // ✅ FIXED: Use your deployed backend URL
      const response = await fetch('https://password-reset-app-1-k5vy.onrender.com/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const result = await response.json();
      console.log('📨 Backend response:', result);
      
      if (result.success) {
        setEmailSent(true);
        console.log('✅ Reset token generated:', result.token);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('❌ Error:', err);
      setError('Failed to send reset email. Please try again later.');
    }
  };

  const handleBackToHome = () => {
    onNavigate('home');
  };

  if (emailSent) {
    return (
      <SuccessMessage 
        email={userEmail}
        onBackToHome={handleBackToHome}
      />
    );
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-header bg-white py-3">
              <button 
                className="btn btn-link p-0"
                onClick={handleBackToHome}
              >
                <i className="fas fa-arrow-left me-2"></i>
                Back to Home
              </button>
            </div>
            <div className="card-body p-4">
              <ForgotPassword 
                onSubmit={handleEmailSubmit}
                error={error}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;