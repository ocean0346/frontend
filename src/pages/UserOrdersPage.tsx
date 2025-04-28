import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { getUserOrders } from '../app/api';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { Order } from '../types';
import axios from 'axios';

const UserOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugMessage, setDebugMessage] = useState<string | null>(null);

  useEffect(() => {
    // Kiểm tra đăng nhập
    if (!user) {
      console.log('UserOrdersPage: Không có người dùng đăng nhập');
      navigate('/login?redirect=profile/orders');
      return;
    }
    
    console.log('UserOrdersPage: Thông tin người dùng:', JSON.stringify(user));
    
    const fetchOrders = async () => {
      try {
        setLoading(true);
        console.log('UserOrdersPage: Đang lấy đơn hàng...');
        const data = await getUserOrders();
        console.log('UserOrdersPage: Kết quả đơn hàng:', JSON.stringify(data));
        setOrders(data);
        setLoading(false);
      } catch (err: any) {
        console.error('UserOrdersPage: Lỗi khi lấy đơn hàng:', err);
        console.error('UserOrdersPage: Chi tiết lỗi:', err.response?.data || err.message);
        setError(err.response?.data?.message || err.message || 'Không thể tải danh sách đơn hàng');
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  // Hàm kiểm tra debug
  const checkDebugAPI = async () => {
    try {
      setDebugMessage('Đang kiểm tra...');
      const response = await axios.get('https://backend-3e21.onrender.com/api/orders/debug/all');
      setDebugMessage(`Kiểm tra thành công: Tìm thấy ${response.data.count} đơn hàng`);
      console.log('Debug API response:', response.data);
    } catch (error: any) {
      setDebugMessage(`Lỗi kiểm tra: ${error.message}`);
      console.error('Debug API error:', error);
    }
  };

  // Format ngày tháng
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Đơn hàng của tôi</h1>
        <div className="flex gap-2">
          <button 
            onClick={checkDebugAPI}
            className="bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors"
          >
            Kiểm tra API
          </button>
          <Link 
            to="/" 
            className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>

      {debugMessage && (
        <div className="mb-4 p-4 bg-yellow-100 text-yellow-800 rounded-md">
          <p className="font-medium">{debugMessage}</p>
        </div>
      )}

      {loading ? (
        <Loader size="lg" text="Đang tải danh sách đơn hàng..." />
      ) : error ? (
        <Message variant="error">{error}</Message>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-16 w-16 mx-auto text-gray-400 mb-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
            />
          </svg>
          <h2 className="text-xl font-medium mb-2">Bạn chưa có đơn hàng nào</h2>
          <p className="text-gray-600 mb-4">
            Hãy tiếp tục mua sắm để tạo đơn hàng đầu tiên của bạn.
          </p>
          <Link 
            to="/" 
            className="inline-block bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Bắt đầu mua sắm
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã đơn hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày đặt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thanh toán
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giao hàng
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chi tiết
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order._id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      ${order.totalPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.isPaid ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Đã thanh toán
                        </span>
                      ) : (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Chưa thanh toán
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.isDelivered ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Đã giao hàng
                        </span>
                      ) : (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Đang xử lý
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Link
                        to={`/order/${order._id}`}
                        className="text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Xem chi tiết
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
  );
};

export default UserOrdersPage; 