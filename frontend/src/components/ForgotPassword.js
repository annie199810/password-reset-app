import React, { useState } from 'react';

const ForgotPassword = ({ onSubmit, error }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      return;
    }

    setIsSubmitting(true);
    await onSubmit(email);
    setIsSubmitting(false);
  };

  return (
    <div>
      <div className="text-center mb-4">
        <i className="fas fa-envelope fa-3x text-primary mb-3"></i>
        <h2>Reset Your Password</h2>
        <p className="text-muted">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            <i className="fas fa-envelope me-2"></i>
            Email Address
          </label>
          <input
            type="email"
            className="form-control form-control-lg"
            id="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg w-100"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Sending...
            </>
          ) : (
            <>
              <i className="fas fa-paper-plane me-2"></i>
              Send Reset Link
            </>
          )}
        </button>
      </form>

      <div className="mt-4 p-3 bg-light rounded">
        <small className="text-muted">
          <i className="fas fa-info-circle me-1"></i>
          You'll receive an email with a password reset link that expires in 1 hour.
        </small>
      </div>
    </div>
  );
};

export default ForgotPassword;