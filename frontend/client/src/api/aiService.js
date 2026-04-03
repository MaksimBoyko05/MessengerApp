import api from './axiosInstance';

export const aiService = {
  sendAnalyticsUsage: async (suggestionId, allSuggestionIds) => {
    const response = await api.post('/ai/smart-reply/usage', {
      suggestionId,
      allSuggestionIds
    });
    return response.data;
  },
  sendAnalyticsIgnored: async (suggestionIds) => {
    const response = await api.post('/ai/smart-reply/ignore', {
      suggestionIds,
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