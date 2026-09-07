// src/services/categoryService.js
import api from './api';

export const getAllCategories = async () => {
  const { data } = await api.get('/category');
  return data; // { success, count, categories }
};

export const createCategory = async (categoryData) => {
  const { data } = await api.post('/category', categoryData);
  return data;
};

export const updateCategory = async (id, categoryData) => {
  const { data } = await api.put(`/category/${id}`, categoryData);
  return data;
};

export const deleteCategory = async (id) => {
  const { data } = await api.delete(`/category/${id}`);
  return data;
};