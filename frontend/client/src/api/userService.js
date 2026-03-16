import api from './axiosInstance';

export const userService = {
  getUserData: async () => {
    const response = await api.get('auth/me');
    return response.data;
  },
  forgotPassword: async (email) => {
    const response = await api.post(`/auth/forgot-password`, {
      email
    });
    return response.data;
  },
  verifyResetToken: async (token) => {
    return api.get(`/auth/reset-password/${token}`);
  },
  resetPassword: async (token, newPassword) => {
    const response = await api.post(`/auth/reset-password`, {
      token,
      newPassword
    });
    return response.data;
  },
  updateUser: async (userId, payload) => {
    const response = await api.put(`users/${userId}`, payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data;
  },
  setIsPrivate: async (isPrivate) => {
    const response = await api.patch(`/users/privacy`, {
      isPrivate
    });
    return response.data;
  },
  updateTheme: async (theme) => {
    const response = await api.put(`/users/theme`, {
      theme
    });
    return response.data;
  },
  changePassword: async (userId, oldPassword, newPassword) => {
    const response = await api.put(`/users/${userId}/password`, {
      oldPassword,
      newPassword
    });
    return response.data;
  },
  changeEmail: async (userId, newEmail) => {
    const response = await api.post(`/users/${userId}/request-email-change`, {
      newEmail
    });
    return response.data;
  },
  verifyEmail: async (token) => {
    const response = await api.post(`/users/verify-email`, {
      token
    });
    return response.data;
  },
}