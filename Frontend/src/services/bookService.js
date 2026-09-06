// src/services/bookService.js
import api from './api';

export const getAllBooks = async (params = {}) => {
  // params: { search, category, minPrice, maxPrice, author, sort, page, limit }
  const { data } = await api.get('/books', { params });
  return data;
};

export const getBookById = async (id) => {
  const { data } = await api.get(`/books/${id}`);
  return data;
};

export const createBook = async (bookData) => {
  const { data } = await api.post('/books', bookData);
  return data;
};

export const updateBook = async (id, bookData) => {
  const { data } = await api.put(`/books/${id}`, bookData);
  return data;
};

export const deleteBook = async (id) => {
  const { data } = await api.delete(`/books/${id}`);
  return data;
};