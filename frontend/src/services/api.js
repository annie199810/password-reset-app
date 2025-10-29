const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const passwordResetAPI = {
  requestReset: async (email) => {
    console.log('Requesting reset for:', email);
    return { success: true };
  },

  verifyToken: async (token) => { 
    console.log('Verifying token:', token);
    return { valid: true };
  },

  resetPassword: async (token, newPassword) => {
    console.log('Resetting password with token:', token);
    return { success: true };
  }
};

export default passwordResetAPI;