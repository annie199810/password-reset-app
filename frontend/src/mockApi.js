// Mock API for testing since backend doesn't have reset-password endpoint
export const mockResetPassword = (token, newPassword) => {
    console.log('🎭 Mock API: Reset Password');
    console.log('Token:', token);
    console.log('New Password Length:', newPassword.length);
    
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate API delay
            if (token && newPassword.length >= 6) {
                resolve({
                    success: true,
                    message: 'Password reset successfully! (Mock API)'
                });
            } else {
                reject({
                    response: {
                        data: {
                            message: 'Invalid token or password too short'
                        }
                    }
                });
            }
        }, 1500);
    });
};

export const mockForgotPassword = (email) => {
    console.log('🎭 Mock API: Forgot Password');
    console.log('Email:', email);
    
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                message: 'Password reset link sent! (Mock API)',
                token: 'mock-token-' + Date.now()
            });
        }, 1000);
    });
};