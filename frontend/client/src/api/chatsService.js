import api from './axiosInstance';

export const chatsService = {
  getAll: async () => {
    const response = await api.get('/chats');
    return response.data;
  },
  getMessages: async (chatId) => {
    const response = await api.get(`messages/chat/${chatId}`);
    return response.data;
  },
  sendMessage: async (payload) => {
    const response = await api.post('/messages', payload)
    return response.data;
  }
};