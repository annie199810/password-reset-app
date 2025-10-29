import React, { useState, useEffect } from 'react';
import ResetPassword from '../components/ResetPassword';
import SuccessMessage from '../components/SuccessMessage';
import ErrorMessage from '../components/ErrorMessage';

const ResetPasswordPage = ({ onNavigate }) => {
  const [resetSuccess, setResetSuccess] = useState(false);
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState(true);

  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (!token) {
      setTokenValid(false);
      setError('Invalid or missing reset token.');
    }
    
  }, []);

  const handlePasswordReset = async (newPassword) => {
    try {
      setError('');
      
      setTimeout(() => {
        setResetSuccess(true);
      }, 1000);
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    }
  };

  const handleBackToHome = () => {
    onNavigate('home');
  };

  if (!tokenValid) {
    return (
      <ErrorMessage 
        message={error}
        onBackToHome={handleBackToHome}
      />
    );
  }

  if (resetSuccess) {
    return (
      <SuccessMessage 
        isPasswordReset={true}
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
              <ResetPassword 
                onSubmit={handlePasswordReset}
                error={error}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;