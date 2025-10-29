import React, { useState } from 'react';

const ResetPassword = ({ onSubmit, error }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setValidationError(passwordError);
      return;
    }

    setIsSubmitting(true);
    await onSubmit(password);
    setIsSubmitting(false);
  };

  return (
    <div>
      <div className="text-center mb-4">
        <i className="fas fa-key fa-3x text-primary mb-3"></i>
        <h2>Create New Password</h2>
        <p className="text-muted">
          Please enter your new password below.
        </p>
      </div>

      {(error || validationError) && (
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error || validationError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            <i className="fas fa-lock me-2"></i>
            New Password
          </label>
          <input
            type="password"
            className="form-control form-control-lg"
            id="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="form-text">
            Password must be at least 8 characters with uppercase, lowercase, and numbers.
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="confirmPassword" className="form-label">
            <i className="fas fa-lock me-2"></i>
            Confirm New Password
          </label>
          <input
            type="password"
            className="form-control form-control-lg"
            id="confirmPassword"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
              Resetting...
            </>
          ) : (
            <>
              <i className="fas fa-save me-2"></i>
              Reset Password
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;