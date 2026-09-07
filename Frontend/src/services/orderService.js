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
  const { data } = await api.get("/order/my-order");
  return data;
};

export const getAllOrdersAdmin = async (params = {}) => {
  const { data } = await api.get('/order', { params });
  return data;
};

export const updateOrderStatus = async (id, orderStatus) => {
  const { data } = await api.put(`/order/${id}/status`, { orderStatus });
  return data;
};
