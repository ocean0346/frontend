import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { getOrderDetails, payOrder, cancelOrder } from '../app/api';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { Order } from '../types';

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingPay, setLoadingPay] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    // Kiểm tra đăng nhập
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        if (id) {
          const data = await getOrderDetails(id);
          setOrder(data);
        }
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Không thể tải thông tin đơn hàng');
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, user, navigate, cancelSuccess]);

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  // Handle payment
  const handlePay = async () => {
    try {
      setLoadingPay(true);
      if (id) {
        // Giả lập dữ liệu thanh toán thành công
        const paymentResult = {
          id: Date.now().toString(),
          status: 'COMPLETED',
          update_time: new Date().toISOString(),
          email_address: user?.email,
        };
        
        const updatedOrder = await payOrder(id, paymentResult);
        setOrder(updatedOrder);
      }
      setLoadingPay(false);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi thanh toán');
      setLoadingPay(false);
    }
  };

  // Handle cancel order
  const handleCancelOrder = async () => {
    // Hiển thị xác nhận
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) {
      return;
    }
    
    try {
      setLoadingCancel(true);
      setCancelError(null);
      
      if (id) {
        const updatedOrder = await cancelOrder(id);
        setOrder(updatedOrder);
        setCancelSuccess(true);
      }
      
      setLoadingCancel(false);
    } catch (err: any) {
      setCancelError(err.response?.data?.message || 'Không thể hủy đơn hàng');
      setLoadingCancel(false);
    }
  };

  if (loading) {
    return <Loader size="lg" text="Đang tải thông tin đơn hàng..." />;
  }

  if (error) {
    return <Message variant="error">{error}</Message>;
  }

  if (!order) {
    return <Message variant="error">Không tìm thấy thông tin đơn hàng</Message>;
  }

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Chi tiết đơn hàng</h1>
        <div>
          <Link
            to="/profile/orders"
            className="text-indigo-600 hover:text-indigo-800 mr-4"
          >
            Quay lại danh sách đơn hàng
          </Link>
          <Link 
            to="/" 
            className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>

      {cancelSuccess && (
        <Message variant="success" className="mb-4">
          Đơn hàng đã được hủy thành công
        </Message>
      )}

      {cancelError && (
        <Message variant="error" className="mb-4">
          {cancelError}
        </Message>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thông tin đơn hàng */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">
              Mã đơn hàng: {order._id}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Thông tin đơn hàng</h3>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Ngày đặt:</span> {formatDate(order.createdAt)}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Trạng thái thanh toán:</span>{' '}
                  {order.isPaid ? (
                    <span className="text-green-600">Đã thanh toán ({formatDate(order.paidAt)})</span>
                  ) : (
                    <span className="text-red-600">Chưa thanh toán</span>
                  )}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Trạng thái giao hàng:</span>{' '}
                  {order.isDelivered ? (
                    <span className="text-green-600">Đã giao hàng ({formatDate(order.deliveredAt)})</span>
                  ) : (
                    <span className="text-yellow-600">Đang xử lý</span>
                  )}
                </p>
                {order.isCancelled && (
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Trạng thái đơn hàng:</span>{' '}
                    <span className="text-red-600">Đã hủy ({formatDate(order.cancelledAt)})</span>
                  </p>
                )}
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Phương thức thanh toán:</span> {order.paymentMethod}
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Địa chỉ giao hàng</h3>
                <p className="text-sm text-gray-600">
                  {order.shippingAddress.address}, {order.shippingAddress.city},{' '}
                  {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                </p>
                {order.shippingAddress.phoneNumber && (
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Số điện thoại:</span> {order.shippingAddress.phoneNumber}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Danh sách sản phẩm */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <h2 className="text-xl font-semibold p-6 pb-4 border-b border-gray-200">
              Sản phẩm đặt mua
            </h2>
            <div className="divide-y divide-gray-200">
              {order.orderItems.map((item) => (
                <div key={item.product} className="p-6 flex items-center">
                  <div className="h-20 w-20 flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-20 w-20 object-cover rounded"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <Link
                      to={`/product/${item.product}`}
                      className="text-lg font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      {item.name}
                    </Link>
                    <p className="text-gray-600 mt-1">
                      {item.qty} x ${item.price.toFixed(2)} = ${(item.qty * item.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tổng đơn hàng */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">
              Tổng đơn hàng
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Tạm tính:</span>
                <span>
                  ${order.orderItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Phí vận chuyển:</span>
                <span>$10.00</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Thuế (10%):</span>
                <span>
                  ${(order.totalPrice * 0.1).toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between pt-3 border-t border-gray-200 font-bold">
                <span>Tổng cộng:</span>
                <span className="text-xl text-indigo-600">${order.totalPrice.toFixed(2)}</span>
              </div>

              {!order.isPaid && !order.isCancelled && (
                <div className="mt-6">
                  <button
                    onClick={handlePay}
                    disabled={loadingPay}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 mb-3"
                  >
                    {loadingPay ? <Loader size="sm" text="Đang xử lý..." /> : 'Thanh toán ngay'}
                  </button>
                </div>
              )}
              
              {/* Button hủy đơn hàng */}
              {!order.isDelivered && !order.isPaid && !order.isCancelled && (
                <div className="mt-3">
                  <button
                    onClick={handleCancelOrder}
                    disabled={loadingCancel}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {loadingCancel ? <Loader size="sm" text="Đang xử lý..." /> : 'Hủy đơn hàng'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage; 