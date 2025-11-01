const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://password-reset-app-3.onrender.com';

export const passwordResetAPI = {
  requestReset: async (email) => {
    console.log('🔄 Requesting reset for:', email);
    const response = await fetch(`${API_BASE_URL}/api/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    return await response.json();
  },

  verifyToken: async (token) => { 
    console.log('🔍 Verifying token:', token);
    const response = await fetch(`${API_BASE_URL}/api/verify-reset-token/${token}`);
    return await response.json();
  },

  resetPassword: async (token, newPassword) => {
    console.log('🔄 Resetting password with token:', token);
    const response = await fetch(`${API_BASE_URL}/api/reset-password/${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newPassword }),
    });
    return await response.json();
  }
};

export default passwordResetAPI;