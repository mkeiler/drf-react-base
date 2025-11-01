import api from './api';

// Projects API
export const projectsAPI = {
  // Get all projects
  list: async () => {
    const response = await api.get('/api/projects/');
    return response.data;
  },

  // Get single project
  get: async (id) => {
    const response = await api.get(`/api/projects/${id}/`);
    return response.data;
  },

  // Create project
  create: async (data) => {
    const response = await api.post('/api/projects/', data);
    return response.data;
  },

  // Update project
  update: async (id, data) => {
    const response = await api.put(`/api/projects/${id}/`, data);
    return response.data;
  },

  // Delete project
  delete: async (id) => {
    await api.delete(`/api/projects/${id}/`);
  },

  // Add member
  addMember: async (id, userId) => {
    const response = await api.post(`/api/projects/${id}/add-member/`, { user_id: userId });
    return response.data;
  },

  // Remove member
  removeMember: async (id, userId) => {
    await api.delete(`/api/projects/${id}/remove-member/${userId}/`);
  },
};

// Sprints API
export const sprintsAPI = {
  // List sprints
  list: async (projectId) => {
    const params = projectId ? { project_id: projectId } : {};
    const response = await api.get('/api/sprints/', { params });
    return response.data;
  },

  // Get single sprint
  get: async (id) => {
    const response = await api.get(`/api/sprints/${id}/`);
    return response.data;
  },

  // Create sprint
  create: async (data) => {
    const response = await api.post('/api/sprints/', data);
    return response.data;
  },

  // Update sprint
  update: async (id, data) => {
    const response = await api.put(`/api/sprints/${id}/`, data);
    return response.data;
  },

  // Delete sprint
  delete: async (id) => {
    await api.delete(`/api/sprints/${id}/`);
  },

  // Set sprint as active
  setActive: async (id) => {
    const response = await api.patch(`/api/sprints/${id}/set_active/`);
    return response.data;
  },

  // Complete sprint
  complete: async (id) => {
    const response = await api.patch(`/api/sprints/${id}/complete/`);
    return response.data;
  },
};

// Tasks API
export const tasksAPI = {
  // List tasks
  list: async (filters = {}) => {
    const response = await api.get('/api/tasks/', { params: filters });
    return response.data;
  },

  // Get single task
  get: async (id) => {
    const response = await api.get(`/api/tasks/${id}/`);
    return response.data;
  },

  // Create task
  create: async (data) => {
    const response = await api.post('/api/tasks/', data);
    return response.data;
  },

  // Update task
  update: async (id, data) => {
    const response = await api.put(`/api/tasks/${id}/`, data);
    return response.data;
  },

  // Partial update (PATCH)
  patch: async (id, data) => {
    const response = await api.patch(`/api/tasks/${id}/`, data);
    return response.data;
  },

  // Delete task
  delete: async (id) => {
    await api.delete(`/api/tasks/${id}/`);
  },

  // Move task (change status/order)
  move: async (id, data) => {
    const response = await api.patch(`/api/tasks/${id}/move/`, data);
    return response.data;
  },
};

// Comments API
export const commentsAPI = {
  // List comments for a task
  list: async (taskId) => {
    const response = await api.get('/api/comments/', { params: { task_id: taskId } });
    return response.data;
  },

  // Create comment
  create: async (data) => {
    const response = await api.post('/api/comments/', data);
    return response.data;
  },

  // Update comment
  update: async (id, data) => {
    const response = await api.put(`/api/comments/${id}/`, data);
    return response.data;
  },

  // Delete comment
  delete: async (id) => {
    await api.delete(`/api/comments/${id}/`);
  },
};
