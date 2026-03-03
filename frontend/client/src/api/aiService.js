import api from './axiosInstance';

export const aiService = {
  sendAnalytics: async (suggestionId) => {
    const response = await api.post('/ai/analytics', {
      suggestionId
    });
    return response.data;
  },
  askAi: async (chatId, query) => {
    const response = await api.post('/ai/ask', {
      chatId,
      query
    });
    return response.data;
  },
}