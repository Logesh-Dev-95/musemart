import api from './axiosConfig';

export const placeOrder = async (orderData, token) => {
  const response = await api.post('/orders', orderData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getMyOrders = async (token) => {
  const response = await api.get('/my-orders', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};