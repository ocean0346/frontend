import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { updateUserProfile, clearAuthError } from '../features/auth/authSlice';
import { getUserOrders } from '../app/api';
import { Order } from '../types';
import Message from '../components/Message';
import Loader from '../components/Loader';

const ProfilePage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [errorOrders, setErrorOrders] = useState<string | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { user, loading, error } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=profile');
    } else {
      setName(user.name || '');
      setEmail(user.email || '');
      
      // Lấy danh sách đơn hàng của người dùng
      const fetchOrders = async () => {
        try {
          setLoadingOrders(true);
          const data = await getUserOrders();
          setOrders(data);
          setLoadingOrders(false);
        } catch (err: any) {
          setErrorOrders(err.message || 'Không thể tải danh sách đơn hàng');
          setLoadingOrders(false);
        }
      };
      
      fetchOrders();
    }
  }, [user, navigate]);

  const submitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Kiểm tra mật khẩu có khớp không
    if (password && password !== confirmPassword) {
      setPasswordMatch(false);
      return;
    }
    
    setPasswordMatch(true);
    
    // Dữ liệu để cập nhật
    const userData = {
      name,
      email,
      ...(password && { password }) // Chỉ gửi password nếu có nhập
    };
    
    dispatch(updateUserProfile(userData))
      .unwrap()
      .then(() => {
        setSuccessMessage('Cập nhật thông tin thành công');
        setPassword('');
        setConfirmPassword('');
        // Xóa thông báo thành công sau 3 giây
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      })
      .catch((err) => {
        console.error('Lỗi khi cập nhật:', err);
      });
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Thông tin tài khoản */}
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-bold mb-6">Thông tin tài khoản</h2>
          
          {successMessage && (
            <Message variant="success" className="mb-4">
              {successMessage}
            </Message>
          )}
          
          {error && (
            <Message 
              variant="error" 
              className="mb-4"
              onClose={() => dispatch(clearAuthError())}
            >
              {error}
            </Message>
          )}
          
          {!passwordMatch && (
            <Message 
              variant="error" 
              className="mb-4"
            >
              Mật khẩu không khớp
            </Message>
          )}
          
          {loading ? (
            <Loader />
          ) : (
            <form onSubmit={submitHandler} className="bg-white shadow-md rounded-lg p-6">
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                  Họ tên
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                  Mật khẩu mới (để trống nếu không thay đổi)
                </label>
                <input
                  type="password"
                  id="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Để trống nếu không muốn thay đổi"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={!password}
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-200"
              >
                Cập nhật
              </button>
            </form>
          )}
        </div>
        
        {/* Lịch sử đơn hàng */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-6">Lịch sử đơn hàng</h2>
          
          {loadingOrders ? (
            <Loader size="lg" text="Đang tải đơn hàng..." />
          ) : errorOrders ? (
            <Message variant="error">{errorOrders}</Message>
          ) : orders.length === 0 ? (
            <Message variant="info">
              Bạn chưa có đơn hàng nào. <Link to="/" className="text-indigo-600 hover:underline">Mua sắm ngay</Link>
            </Message>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mã đơn hàng
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày đặt
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tổng cộng
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thanh toán
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Giao hàng
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order._id}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${order.totalPrice.toFixed(2)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {order.isPaid ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Đã thanh toán
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Chưa thanh toán
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {order.isDelivered ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Đã giao hàng
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Đang xử lý
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {order.isCancelled ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Đã hủy
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              Đang hoạt động
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            to={`/order/${order._id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Chi tiết
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 