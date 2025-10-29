import React from 'react';

const SuccessMessage = ({ email, isPasswordReset, onBackToHome }) => {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body text-center p-5">
              <div className="text-success mb-4">
                <i className="fas fa-check-circle fa-4x"></i>
              </div>
              
              <h2 className="card-title mb-3">
                {isPasswordReset ? 'Password Reset Successful!' : 'Check Your Email'}
              </h2>
              
              <p className="card-text text-muted mb-4">
                {isPasswordReset 
                  ? 'Your password has been successfully reset. You can now log in with your new password.'
                  : `We've sent a password reset link to ${email}. Please check your inbox and follow the instructions.`
                }
              </p>

              {!isPasswordReset && (
                <div className="alert alert-info" role="alert">
                  <i className="fas fa-clock me-2"></i>
                  The reset link will expire in 1 hour for security reasons.
                </div>
              )}

              <button 
                className="btn btn-primary btn-lg"
                onClick={onBackToHome}
              >
                <i className="fas fa-home me-2"></i>
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessMessage;