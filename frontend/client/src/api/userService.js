import api from './axiosInstance';

export const userService = {
  getUserData: async () => {
    const response = await api.get('auth/me');
    return response.data;
  },
}