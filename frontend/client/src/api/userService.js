import api from './axiosInstance';

export const userService = {
  getUserData: async () => {
    const response = await api.get('auth/me');
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