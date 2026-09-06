// src/services/userService.js
import api from './api';

export const getAllUsersAdmin = async (params = {}) => {
  const { data } = await api.get('/users', { params });
  return data;
};

export const updateUserAdmin = async (id, userData) => {
  const { data } = await api.put(`/users/${id}`, userData);
  return data;
};

export const deleteUserAdmin = async (id) => {
  const { data } = await api.delete(`/users/${id}`);
  return data;
};