import React, { useState } from 'react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('developerannie057@gmail.com');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            console.log('🔄 Sending POST request to: http://localhost:5001/api/reset-password');
            console.log('📧 Email being sent:', email);

            const response = await fetch('http://localhost:5001/api/reset-password', {
                method: 'POST', // MUST BE POST
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email })
            });

            const data = await response.json();
            console.log('✅ Backend response:', data);

            if (data.success) {
                setMessage('Password reset link has been sent to your email address.');
                setEmail('');
            } else {
                setError(data.message || 'Failed to send reset link');
            }
        } catch (err) {
            console.error('💥 Full error:', err);
            console.error('📡 Network error details:', err.message);
            setError('Cannot connect to server. Please make sure backend is running on port 5001.');
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
                                <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                                     style={{ width: '60px', height: '60px' }}>
                                    <i className="bi bi-shield-lock-fill text-white" style={{ fontSize: '1.5rem' }}></i>
                                </div>
                                <h2 className="fw-bold text-dark mb-2">Reset Your Password</h2>
                                <p className="text-muted">Enter your email to receive a reset link</p>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label htmlFor="email" className="form-label fw-semibold text-dark">
                                        <i className="bi bi-envelope-fill text-primary me-2"></i>
                                        Email Address
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0">
                                            <i className="bi bi-at text-muted"></i>
                                        </span>
                                        <input
                                            type="email"
                                            className="form-control border-start-0 ps-0"
                                            id="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            placeholder="name@company.com"
                                            style={{ borderLeft: 'none' }}
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
                                    className="btn btn-primary w-100 py-3 fw-semibold shadow"
                                    style={{
                                        borderRadius: '12px',
                                        fontSize: '1.1rem',
                                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                        border: 'none'
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-send-check-fill me-2"></i>
                                            Send Reset Link
                                        </>
                                    )}
                                </button>

                                <div className="text-center mt-4">
                                    <a href="/" className="text-decoration-none text-muted">
                                        <i className="bi bi-arrow-left me-2"></i>
                                        Back to Login
                                    </a>
                                </div>
                            </form>

                            <div className="text-center mt-4 pt-3 border-top">
                                <small className="text-muted">
                                    <i className="bi bi-info-circle me-1"></i>
                                    You will receive a link to reset your password
                                </small>
                            </div>

                            <div className="mt-3 p-3 bg-light rounded">
                                <small className="text-muted">
                                    <strong>Demo Info:</strong> Using email: developerannie057@gmail.com<br/>
                                    <strong>Backend:</strong> http://localhost:5001
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;