// src/services/categoryService.js
import api from './api';

export const getAllCategories = async () => {
  const { data } = await api.get('/categories');
  return data; // { success, count, categories }
};

export const createCategory = async (categoryData) => {
  const { data } = await api.post('/categories', categoryData);
  return data;
};

export const deleteCategory = async (id) => {
  const { data } = await api.delete(`/categories/${id}`);
  return data;
};