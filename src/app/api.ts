import axios from 'axios';
import { Product, User, Order } from '../types';
import { ProductFilters } from '../features/products/productSlice';

const API_URL = 'https://backend-3e21.onrender.com/api';

const API = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Thêm interceptor để thêm token vào header
API.interceptors.request.use((req) => {
  const userJson = localStorage.getItem('user');
  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      if (user.token) {
        req.headers.Authorization = `Bearer ${user.token}`;
        console.log('Token được thêm vào header:', `Bearer ${user.token.substring(0, 15)}...`);
      } else {
        console.log('Không tìm thấy token trong dữ liệu người dùng');
      }
    } catch (error) {
      console.error('Lỗi khi parse dữ liệu người dùng:', error);
    }
  } else {
    console.log('Không tìm thấy dữ liệu người dùng trong localStorage');
  }
  return req;
});

// Product APIs
export const fetchProducts = async (filters: ProductFilters = {}) => {
  // Xây dựng query params từ filters
  const params = new URLSearchParams();
  
  if (filters.keyword) params.append('keyword', filters.keyword);
  if (filters.category) params.append('category', filters.category);
  if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
  if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
  if (filters.minRating !== undefined) params.append('minRating', filters.minRating.toString());
  
  const { data } = await API.get(`/products?${params.toString()}`);
  return data;
};

export const fetchProductDetails = async (id: string) => {
  const { data } = await API.get(`/products/${id}`);
  return data;
};

export const createProductReview = async (productId: string, review: { rating: number; comment: string }) => {
  const { data } = await API.post(`/products/${productId}/reviews`, review);
  return data;
};

export const createProduct = async (productData: Partial<Product>) => {
  const response = await API.post<Product>('/products', productData);
  return response.data;
};

export const updateProduct = async (id: string, productData: Partial<Product>) => {
  const response = await API.put<Product>(`/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id: string) => {
  const response = await API.delete(`/products/${id}`);
  return response.data;
};

// User APIs
export const login = async (email: string, password: string) => {
  try {
    // Giữ giỏ hàng chưa đăng nhập (nếu có)
    const anonymousCartItems = localStorage.getItem('cartItems');
    const anonymousShippingAddress = localStorage.getItem('shippingAddress');
    const anonymousPaymentMethod = localStorage.getItem('paymentMethod');
    
    const { data } = await API.post('/users/login', { email, password });
    localStorage.setItem('user', JSON.stringify(data));
    
    // Nếu user đã có giỏ hàng từ phiên trước, ưu tiên sử dụng
    const userCartItems = localStorage.getItem(`cartItems_${data._id}`);
    const userShippingAddress = localStorage.getItem(`shippingAddress_${data._id}`);
    const userPaymentMethod = localStorage.getItem(`paymentMethod_${data._id}`);
    
    console.log('Đăng nhập: User cart items:', userCartItems);
    console.log('Đăng nhập: Anonymous cart items:', anonymousCartItems);
    
    // Đặt giỏ hàng theo userId
    if (userCartItems) {
      console.log('Sử dụng giỏ hàng của user');
      // Nếu đã có giỏ hàng của user, sử dụng nó
      localStorage.setItem('cartItems', userCartItems);
    } else if (anonymousCartItems) {
      console.log('Sử dụng giỏ hàng chưa đăng nhập');
      // Nếu không, sử dụng giỏ hàng chưa đăng nhập và lưu cho user
      localStorage.setItem('cartItems', anonymousCartItems);
      localStorage.setItem(`cartItems_${data._id}`, anonymousCartItems);
    } else {
      console.log('Không có giỏ hàng nào');
      // Đảm bảo cartItems là mảng rỗng khi không có giỏ hàng
      localStorage.setItem('cartItems', '[]');
    }
    
    // Tương tự với địa chỉ giao hàng
    if (userShippingAddress) {
      localStorage.setItem('shippingAddress', userShippingAddress);
    } else if (anonymousShippingAddress) {
      localStorage.setItem('shippingAddress', anonymousShippingAddress);
      localStorage.setItem(`shippingAddress_${data._id}`, anonymousShippingAddress);
    } else {
      localStorage.removeItem('shippingAddress');
    }
    
    // Tương tự với phương thức thanh toán
    if (userPaymentMethod) {
      localStorage.setItem('paymentMethod', userPaymentMethod);
    } else if (anonymousPaymentMethod) {
      localStorage.setItem('paymentMethod', anonymousPaymentMethod);
      localStorage.setItem(`paymentMethod_${data._id}`, anonymousPaymentMethod);
    } else {
      localStorage.removeItem('paymentMethod');
    }
    
    return data;
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    throw error;
  }
};

export const register = async (name: string, email: string, password: string) => {
  try {
    // Giữ giỏ hàng chưa đăng nhập (nếu có)
    const anonymousCartItems = localStorage.getItem('cartItems');
    const anonymousShippingAddress = localStorage.getItem('shippingAddress');
    const anonymousPaymentMethod = localStorage.getItem('paymentMethod');
    
    console.log('Gửi yêu cầu đăng ký:', { name, email, password: '***' });
    // Thử cả hai endpoint
    try {
      // Thử đầu tiên với /users
      const { data } = await API.post('/users', { name, email, password });
      console.log('Kết quả đăng ký từ /users:', data);
      localStorage.setItem('user', JSON.stringify(data));
      
      // Lưu giỏ hàng cho user mới
      if (anonymousCartItems) {
        localStorage.setItem(`cartItems_${data._id}`, anonymousCartItems);
        localStorage.setItem('cartItems', anonymousCartItems);
      }
      if (anonymousShippingAddress) {
        localStorage.setItem(`shippingAddress_${data._id}`, anonymousShippingAddress);
        localStorage.setItem('shippingAddress', anonymousShippingAddress);
      }
      if (anonymousPaymentMethod) {
        localStorage.setItem(`paymentMethod_${data._id}`, anonymousPaymentMethod);
        localStorage.setItem('paymentMethod', anonymousPaymentMethod);
      }
      
      return data;
    } catch (userEndpointError) {
      console.error('Lỗi đăng ký từ /users:', userEndpointError);
      // Nếu /users không hoạt động, thử với /users/register
      const { data } = await API.post('/users/register', { name, email, password });
      console.log('Kết quả đăng ký từ /users/register:', data);
      localStorage.setItem('user', JSON.stringify(data));
      
      // Lưu giỏ hàng cho user mới
      if (anonymousCartItems) {
        localStorage.setItem(`cartItems_${data._id}`, anonymousCartItems);
        localStorage.setItem('cartItems', anonymousCartItems);
      }
      if (anonymousShippingAddress) {
        localStorage.setItem(`shippingAddress_${data._id}`, anonymousShippingAddress);
        localStorage.setItem('shippingAddress', anonymousShippingAddress);
      }
      if (anonymousPaymentMethod) {
        localStorage.setItem(`paymentMethod_${data._id}`, anonymousPaymentMethod);
        localStorage.setItem('paymentMethod', anonymousPaymentMethod);
      }
      
      return data;
    }
  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    // Lưu giỏ hàng của user trước khi đăng xuất
    const cartItems = localStorage.getItem('cartItems');
    const shippingAddress = localStorage.getItem('shippingAddress');
    const paymentMethod = localStorage.getItem('paymentMethod');
    
    console.log('Đăng xuất: Cart items trước khi đăng xuất:', cartItems);
    
    // Lấy thông tin user
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        console.log('Đăng xuất: User ID:', user._id);
        // Lưu giỏ hàng cho user này để sau này đăng nhập lại
        if (cartItems) {
          console.log('Đăng xuất: Lưu giỏ hàng cho user', user._id);
          localStorage.setItem(`cartItems_${user._id}`, cartItems);
        }
        if (shippingAddress) localStorage.setItem(`shippingAddress_${user._id}`, shippingAddress);
        if (paymentMethod) localStorage.setItem(`paymentMethod_${user._id}`, paymentMethod);
      } catch (error) {
        console.error('Lỗi khi lưu giỏ hàng trong logout:', error);
      }
    }
    
    // Xóa giỏ hàng hiện tại và thông tin người dùng
    localStorage.removeItem('cartItems');
    localStorage.removeItem('shippingAddress');
    localStorage.removeItem('paymentMethod');
    localStorage.removeItem('user');
    
    // Đặt giỏ hàng về mảng rỗng
    localStorage.setItem('cartItems', '[]');
    
    return { success: true };
  } catch (error) {
    console.error('Lỗi đăng xuất:', error);
    return { success: false, error };
  }
};

export const getUserProfile = async () => {
  const { data } = await API.get('/users/profile');
  return data;
};

export const updateUserProfile = async (userData: any) => {
  const { data } = await API.put('/users/profile', userData);
  
  // Cập nhật thông tin user trong localStorage
  const userJson = localStorage.getItem('user');
  if (userJson) {
    const user = JSON.parse(userJson);
    localStorage.setItem('user', JSON.stringify({ ...user, ...data }));
  }
  
  return data;
};

// Admin APIs
export const getUsers = async () => {
  const response = await API.get<User[]>('/users');
  return response.data;
};

export const deleteUser = async (id: string) => {
  const response = await API.delete(`/users/${id}`);
  return response.data;
};

// Order APIs
export const createOrder = async (orderData: any) => {
  try {
    console.log('API createOrder - Dữ liệu gửi đi:', orderData);
    console.log('API createOrder - Headers:', API.defaults.headers);
    
    // Kiểm tra và log token
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        console.log('API createOrder - Token available:', !!user.token);
      } catch (e) {
        console.error('API createOrder - Error parsing user JSON:', e);
      }
    } else {
      console.warn('API createOrder - No user in localStorage');
    }
    
    const response = await API.post('/orders', orderData);
    console.log('API createOrder - Phản hồi thành công:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('API createOrder - Lỗi:', error);
    console.error('API createOrder - Chi tiết lỗi:', error.response?.data);
    throw error;
  }
};

export const getOrderDetails = async (id: string) => {
  try {
    const response = await API.get(`/orders/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(`Lỗi khi lấy chi tiết đơn hàng ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

export const payOrder = async (orderId: string, paymentResult: any) => {
  try {
    const response = await API.put(`/orders/${orderId}/pay`, paymentResult);
    return response.data;
  } catch (error: any) {
    console.error(`Lỗi khi thanh toán đơn hàng ${orderId}:`, error.response?.data || error.message);
    throw error;
  }
};

export const getUserOrders = async () => {
  try {
    console.log('API getUserOrders - Đang lấy đơn hàng của người dùng');
    // Kiểm tra và log token
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        console.log('API getUserOrders - Token available:', !!user.token);
        if (user.token) {
          console.log('API getUserOrders - Token (masked):', user.token.substring(0, 15) + '...');
        }
      } catch (e) {
        console.error('API getUserOrders - Error parsing user JSON:', e);
      }
    } else {
      console.warn('API getUserOrders - No user in localStorage');
    }
    
    const response = await API.get('/orders/myorders');
    console.log('API getUserOrders - Phản hồi:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Lỗi khi lấy danh sách đơn hàng:', error.response?.data || error.message);
    throw error;
  }
};

export const getOrders = async () => {
  try {
    const response = await API.get<Order[]>('/orders');
    return response.data;
  } catch (error: any) {
    console.error('Lỗi khi lấy tất cả đơn hàng:', error.response?.data || error.message);
    throw error;
  }
};

export const updateOrderToDelivered = async (orderId: string) => {
  try {
    console.log('API updateOrderToDelivered - Đang cập nhật trạng thái giao hàng cho đơn hàng:', orderId);
    const response = await API.put(`/orders/${orderId}/deliver`);
    console.log('API updateOrderToDelivered - Thành công:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('API updateOrderToDelivered - Lỗi:', error);
    console.error('API updateOrderToDelivered - Chi tiết lỗi:', error.response?.data);
    throw error;
  }
};

export const cancelOrder = async (orderId: string) => {
  try {
    console.log('API cancelOrder - Đang hủy đơn hàng:', orderId);
    const response = await API.put(`/orders/${orderId}/cancel`);
    console.log('API cancelOrder - Thành công:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('API cancelOrder - Lỗi:', error);
    console.error('API cancelOrder - Chi tiết lỗi:', error.response?.data);
    throw error;
  }
};

// Upload API
export const uploadImage = async (formData: FormData) => {
  try {
    // Lấy thông tin người dùng từ localStorage để thêm token xác thực
    const userJson = localStorage.getItem('user');
    const headers: Record<string, string> = {
      'Content-Type': 'multipart/form-data',
    };
    
    if (userJson) {
      const user = JSON.parse(userJson);
      if (user.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }
    }
    
    const response = await API.post('/upload', formData, { headers });
    return response.data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Cart
export const addToCartAPI = async (id: string, qty: number) => {
  const { data } = await API.get(`/products/${id}`);
  return {
    ...data,
    qty,
  };
};

// Categories
export const fetchCategories = async () => {
  const { data } = await API.get('/categories');
  return data;
};

export const fetchProductCategories = async () => {
  const { data } = await API.get('/products/categories');
  return data;
};

export const addCategory = async (categoryData: { name: string; description?: string }) => {
  const response = await API.post('/categories', categoryData);
  return response.data;
};

export const updateCategory = async (id: string, categoryData: { name?: string; description?: string }) => {
  const response = await API.put(`/categories/${id}`, categoryData);
  return response.data;
};

export const deleteCategory = async (id: string) => {
  const response = await API.delete(`/categories/${id}`);
  return response.data;
};

export default API; 