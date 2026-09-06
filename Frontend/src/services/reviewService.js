// src/services/reviewService.js
import api from './api';

export const getBookReviews = async (bookId, params = {}) => {
  const { data } = await api.get(`/reviews/${bookId}`, { params });
  return data;
};

export const addBookReview = async (bookId, reviewData) => {
  const { data } = await api.post(`/reviews/${bookId}`, reviewData);
  return data;
};

export const updateBookReview = async (reviewId, reviewData) => {
  const { data } = await api.put(`/reviews/${reviewId}`, reviewData);
  return data;
};

export const deleteBookReview = async (reviewId) => {
  const { data } = await api.delete(`/reviews/${reviewId}`);
  return data;
};