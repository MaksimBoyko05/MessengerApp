import api from './axiosInstance';

export const chatsService = {
  getAll: async () => {
    const response = await api.get('/chats');
    return response.data;
  },
  getChatDetails: async (chatId) => {
    const response = await api.get(`/chats/${chatId}`);
    return response.data;
  },
  getMessages: async (chatId, cursor) => {
    const response = await api.get(`/messages/${chatId}`, {
      params: cursor ? {cursor} : {}
    });
    return response.data;
  },
  sendMessage: async (payload) => {
    const response = await api.post('/messages', payload);
    return response.data;
  },
  generateSmartReply: async (chatId, messageId) => {
    const response = await api.post('/ai/smart-reply', {
      chatId,
      messageId
    });
    return response.data.suggestions;
  },
  searchUsers: async (query) => {
    const response = await api.get('/users/search', {
      params: {q: query}
    });
    return response.data;
  },
  getRecentUsers: async () => {
    const response = await api.get('/users/recent');
    return response.data;
  },
  createOrOpenChat: async (targetUserId) => {
    const response = await api.post('/chats', {targetUserId});
    return response.data;
  },
  createGroup: async (name, memberIds) => {
    const response = await api.post('/chats/groups', {
      name,
      memberIds
    });
    return response.data;
  },
  updateGroupName: async (chatId, newName) => {
    const response = await api.put(`/chats/${chatId}/name`, {
      newName
    });
    return response.data;
  },
  addGroupMember: async (chatId, memberIds) => {
    const response = await api.post(`/chats/${chatId}/members`, {
      memberIds
    });
    return response.data;
  },
  promoteAdmin: async (chatId, targetUserId) => {
    const response = await api.patch(`/chats/${chatId}/members/promote`, {
      targetUserId
    });
    return response.data;
  },
  promoteMember: async (chatId, targetUserId) => {
    const response = await api.patch(`/chats/${chatId}/members/unpromote`, {
      targetUserId
    });
    return response.data;
  },
  deleteMember: async (chatId, targetUserId) => {
    const response = await api.delete(`/chats/${chatId}/members`, {
      data: {
        targetUserId
      }
    });
    return response.data;
  },
  leaveGroup: async (chatId) => {
    const response = await api.delete(`/chats/${chatId}/leave`);
    return response.data;
  },
  uploadGroupImage: async (chatId, payload) => {
    const response = await api.put(`/chats/${chatId}/avatar`, payload);
    return response.data;
  },
  deleteChat: async (chatId, forEveryone) => {
    const response = await api.delete(`/chats/${chatId}`, {
      data: {forEveryone}
    });
    return response.data;
  }
};