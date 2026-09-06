import api from "./api";
export const createOrder = async (orderData) => {
  const { data } = await api.post("/order/create", orderData);
  return data;
};

export const verifyPayment = async (verificationData) => {
  const { data } = await api.post("/order/verify-payment", verificationData);
  return data;
};

export const getMyOrders = async () => {
  const { data } = await api.post("/order/my-order");
  return data;
};

// src/services/orderService.js — add these two functions
export const getAllOrdersAdmin = async (params = {}) => {
  // route is GET /orders (not /orders/admin/all) — protected by isAdmin middleware
  const { data } = await api.get('/orders', { params });
  return data;
};

// src/services/orderService.js
export const updateOrderStatus = async (id, orderStatus) => {
  const { data } = await api.put(`/orders/${id}/status`, { orderStatus });
  return data;
};
