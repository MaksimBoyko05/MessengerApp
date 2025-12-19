import api from './axiosInstance';

export const chatsService = {
  getAll: async () => {
    const response = await api.get('/chats');
    return response.data;
  },
};