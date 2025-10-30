import React, { useState, useEffect } from 'react';
import ResetPassword from '../components/ResetPassword';
import SuccessMessage from '../components/SuccessMessage';
import ErrorMessage from '../components/ErrorMessage';

const ResetPasswordPage = ({ onNavigate }) => {
  const [resetSuccess, setResetSuccess] = useState(false);
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState(true);
  const [token, setToken] = useState('');

  // Get token from URL and verify it
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get('token');
    
    if (!resetToken) {
      setTokenValid(false);
      setError('Invalid or missing reset token.');
      return;
    }
    
    setToken(resetToken);
    
    // Verify the token with backend
    const verifyToken = async () => {
      try {
        console.log('🔍 Verifying token:', resetToken);
        
        const response = await fetch(`https://password-reset-app-1-k5vy.onrender.com/api/verify-reset-token/${resetToken}`);
        const result = await response.json();
        
        console.log('✅ Token verification result:', result);
        
        if (!result.valid) {
          setTokenValid(false);
          setError(result.message || 'Invalid or expired reset token.');
        }
      } catch (err) {
        console.error('❌ Token verification error:', err);
        setTokenValid(false);
        setError('Failed to verify reset token. Please try again.');
      }
    };
    
    verifyToken();
  }, []);

  const handlePasswordReset = async (newPassword) => {
    try {
      setError('');
      console.log('🔄 Resetting password for token:', token);
      
      // ✅ FIXED: Actual API call to reset password
      const response = await fetch(`https://password-reset-app-1-k5vy.onrender.com/api/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword }),
      });
      
      const result = await response.json();
      console.log('📨 Reset password response:', result);
      
      if (result.success) {
        setResetSuccess(true);
        console.log('✅ Password reset successful');
      } else {
        setError(result.message || 'Failed to reset password.');
      }
    } catch (err) {
      console.error('❌ Reset password error:', err);
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