import api from '../api/axios';

const userService = {
  getAll: (params) => api.get('/users', { params }),
  toggleBlock: (id, isBlocked) => api.patch(`/users/${id}/block`, { isBlocked }),
};

export default userService;
