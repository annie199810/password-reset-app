import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        if (!token) {
            setError('Invalid or expired reset link');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch('http://localhost:6000/api/reset-password-confirm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    newPassword
                })
            });

            const data = await response.json();

            if (data.success) {
                setMessage('Password has been reset successfully! Redirecting to login...');
                setTimeout(() => navigate('/'), 3000);
            } else {
                setError(data.message || 'Failed to reset password');
            }
        } catch (err) {
            setError('Cannot connect to server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid vh-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="row h-100 justify-content-center align-items-center">
                <div className="col-xl-4 col-lg-5 col-md-6 col-sm-8">
                    <div className="card border-0 shadow-lg" style={{ 
                        backdropFilter: 'blur(10px)',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '20px'
                    }}>
                        <div className="card-body p-5">
                      
                            <div className="text-center mb-4">
                                <div className="bg-success rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                                     style={{ width: '60px', height: '60px' }}>
                                    <i className="bi bi-key-fill text-white" style={{ fontSize: '1.5rem' }}></i>
                                </div>
                                <h2 className="fw-bold text-dark mb-2">Create New Password</h2>
                                <p className="text-muted">Enter your new password below</p>
                            </div>

                            <form onSubmit={handleSubmit}>
                         
                                <div className="mb-4">
                                    <label htmlFor="newPassword" className="form-label fw-semibold text-dark">
                                        <i className="bi bi-lock-fill text-primary me-2"></i>
                                        New Password
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0">
                                            <i className="bi bi-key text-muted"></i>
                                        </span>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            className="form-control border-start-0 ps-0"
                                            id="newPassword"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            minLength="6"
                                            placeholder="Enter new password"
                                        />
                                        <button 
                                            type="button"
                                            className="input-group-text bg-light border-start-0"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'} text-muted`}></i>
                                        </button>
                                    </div>
                                    <small className="text-muted">Minimum 6 characters</small>
                                </div>
                                
                      
                                <div className="mb-4">
                                    <label htmlFor="confirmPassword" className="form-label fw-semibold text-dark">
                                        <i className="bi bi-lock-fill text-primary me-2"></i>
                                        Confirm Password
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0">
                                            <i className="bi bi-key-fill text-muted"></i>
                                        </span>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            className="form-control border-start-0 ps-0"
                                            id="confirmPassword"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            minLength="6"
                                            placeholder="Confirm new password"
                                        />
                                    </div>
                                </div>

                            
                                {error && (
                                    <div className="alert alert-danger d-flex align-items-center border-0 shadow-sm">
                                        <i className="bi bi-exclamation-octagon-fill me-3 fs-5"></i>
                                        <div className="fw-medium">{error}</div>
                                    </div>
                                )}
                                
                                {message && (
                                    <div className="alert alert-success d-flex align-items-center border-0 shadow-sm">
                                        <i className="bi bi-check-circle-fill me-3 fs-5"></i>
                                        <div className="fw-medium">{message}</div>
                                    </div>
                                )}

                            
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="btn btn-success w-100 py-3 fw-semibold shadow"
                                    style={{ 
                                        borderRadius: '12px',
                                        fontSize: '1.1rem',
                                        background: 'linear-gradient(45deg, #28a745, #20c997)',
                                        border: 'none'
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Resetting...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-check-lg me-2"></i>
                                            Reset Password
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;