import api from '../api/axios';

const commentService = {
  getByNews: (newsId, params) => api.get(`/comments/news/${newsId}`, { params }),
  create: (data) => api.post('/comments', data),
  delete: (id) => api.delete(`/comments/${id}`),
};

export default commentService;
