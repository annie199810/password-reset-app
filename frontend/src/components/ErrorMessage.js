import React from 'react';

const ErrorMessage = ({ message, onBackToHome }) => {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body text-center p-5">
              <div className="text-danger mb-4">
                <i className="fas fa-exclamation-triangle fa-4x"></i>
              </div>
              
              <h2 className="card-title mb-3">Something Went Wrong</h2>
              
              <p className="card-text text-muted mb-4">
                {message || 'An unexpected error occurred. Please try again.'}
              </p>

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

export default ErrorMessage;