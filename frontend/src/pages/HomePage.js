import React from 'react';

const HomePage = ({ onNavigate }) => {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body text-center p-5">
              <h1 className="card-title mb-4">
                <i className="fas fa-lock text-primary me-2"></i>
                Secure Password Reset
              </h1>
              <p className="card-text text-muted mb-4">
                Welcome to our secure password reset system. If you've forgotten your password, 
                we'll help you reset it quickly and securely.
              </p>
              <button 
                className="btn btn-primary btn-lg"
                onClick={() => onNavigate('forgot-password')}
              >
                <i className="fas fa-key me-2"></i>
                Reset Your Password
              </button>
              <div className="mt-4">
                <small className="text-muted">
                  <i className="fas fa-shield-alt me-1"></i>
                  Your security is our priority
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;