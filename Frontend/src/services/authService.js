import api from "./api";

export const register = async (formdata) => {
  const { data } = await api.post("/auth/register", formdata);
  return data;
};

export const login = async (formData) => {
  const { data } = await api.post("/auth/login", formData);
  return data;
};

export const logout = async () => {
  const { data } = await api.post("/auth/logout");
  return data;
};
