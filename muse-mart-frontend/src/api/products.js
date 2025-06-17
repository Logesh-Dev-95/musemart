import api from './axiosConfig';

export const getMyProducts = async (token) => {
  const response = await api.get('/my-products', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const addProduct = async (productData, token) => {
  const response = await api.post('/products', productData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const updateProduct = async (productId, updateData, token) => {
  const response = await api.put(`/products/${productId}`, updateData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export const getSubcategories = async (categoryId) => {
  const response = await api.get(`/categories/${categoryId}/subcategories`);
  return response.data;
};

export const getReceivedOrders = async (token) => {
  const response = await api.get('/received-orders', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const updateOrderStatus = async (orderId, status, token) => {
  const response = await api.patch(`/orders/${orderId}/status`, { status }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}; 

export const getAllProducts = async (filters = {}) => {
  const response = await api.get('/products', { params: filters });
  return response.data;
};