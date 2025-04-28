import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { useDispatch } from 'react-redux';
import { getUserProfile } from './features/auth/authSlice';
import { AppDispatch } from './app/store';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import ProductPage from './pages/ProductPage';
import ProductsPage from './pages/ProductsPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import UserOrdersPage from './pages/UserOrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrderList from './pages/admin/AdminOrderList';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import AdminProductList from './pages/admin/AdminProductList';
import AdminProductEdit from './pages/admin/AdminProductEdit';
import AdminCategoryList from './pages/admin/AdminCategoryList';
import AdminUserList from './pages/admin/AdminUserList';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

// Sử dụng custom hook để có đúng kiểu cho dispatch
const useAppDispatch = () => useDispatch<AppDispatch>();

// Component để khởi tạo ứng dụng và kiểm tra đăng nhập
const AppInitializer: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Kiểm tra nếu có thông tin người dùng trong localStorage
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        // Người dùng đã đăng nhập, cập nhật Redux store
        console.log('Khôi phục phiên đăng nhập từ localStorage');
        // Tùy chọn: Gọi API để xác thực lại token
        dispatch(getUserProfile());
      } catch (error) {
        console.error('Lỗi khi khôi phục thông tin đăng nhập:', error);
      }
    }
  }, [dispatch]);

  return null;
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppInitializer />
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow container mx-auto py-8 px-4">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/search/:keyword" element={<ProductsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/cart/:id" element={<CartPage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-success" element={<OrderSuccessPage />} />
              
              {/* Trang tài khoản người dùng */}
              <Route 
                path="/profile" 
                element={
                  <PrivateRoute>
                    <ProfilePage />
                  </PrivateRoute>
                } 
              />
              
              {/* Đơn hàng của người dùng */}
              <Route 
                path="/profile/orders" 
                element={
                  <PrivateRoute>
                    <UserOrdersPage />
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/order/:id" 
                element={
                  <PrivateRoute>
                    <OrderDetailPage />
                  </PrivateRoute>
                } 
              />
              
              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              
              <Route
                path="/admin/orders"
                element={
                  <AdminRoute>
                    <AdminOrderList />
                  </AdminRoute>
                }
              />
              
              <Route
                path="/admin/order/:id"
                element={
                  <AdminRoute>
                    <AdminOrderDetail />
                  </AdminRoute>
                }
              />
              
              <Route
                path="/admin/products"
                element={
                  <AdminRoute>
                    <AdminProductList />
                  </AdminRoute>
                }
              />
              
              <Route
                path="/admin/product/:id/edit"
                element={
                  <AdminRoute>
                    <AdminProductEdit />
                  </AdminRoute>
                }
              />
              
              <Route
                path="/admin/categories"
                element={
                  <AdminRoute>
                    <AdminCategoryList />
                  </AdminRoute>
                }
              />
              
              <Route
                path="/admin/users"
                element={
                  <AdminRoute>
                    <AdminUserList />
                  </AdminRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </Provider>
  );
}

export default App;
