import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { getOrderDetails, payOrder, updateOrderToDelivered, cancelOrder } from '../../app/api';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import { Order } from '../../types';
import axios from 'axios';

const AdminOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingDeliver, setLoadingDeliver] = useState(false);
  const [deliverSuccess, setDeliverSuccess] = useState(false);
  const [deliverError, setDeliverError] = useState<string | null>(null);
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    // Kiểm tra đăng nhập và quyền admin
    if (!user || !user.isAdmin) {
      navigate('/login');
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        console.log('AdminOrderDetail: Đang lấy thông tin đơn hàng ID:', id);
        
        if (id) {
          const data = await getOrderDetails(id);
          console.log('AdminOrderDetail: Kết quả:', data);
          setOrder(data);
        }
        
        setLoading(false);
      } catch (err: any) {
        console.error('AdminOrderDetail: Lỗi khi lấy đơn hàng:', err);
        console.error('AdminOrderDetail: Chi tiết lỗi:', err.response?.data || err.message);
        setError(err.response?.data?.message || err.message || 'Không thể tải thông tin đơn hàng');
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, user, navigate, deliverSuccess, cancelSuccess]);

  // Xử lý đánh dấu đã giao hàng
  const markAsDeliveredHandler = async () => {
    try {
      setLoadingDeliver(true);
      setDeliverError(null);
      
      if (!id) return;
      
      console.log('AdminOrderDetail: Đánh dấu đã giao hàng cho đơn hàng ID:', id);
      const updatedOrder = await updateOrderToDelivered(id);
      setOrder(updatedOrder);
      setDeliverSuccess(true);
      setLoadingDeliver(false);
    } catch (err: any) {
      console.error('AdminOrderDetail: Lỗi khi cập nhật trạng thái giao hàng:', err);
      console.error('AdminOrderDetail: Chi tiết lỗi:', err.response?.data || err.message);
      setDeliverError(err.response?.data?.message || err.message || 'Không thể cập nhật trạng thái giao hàng');
      setDeliverSuccess(false);
      setLoadingDeliver(false);
    }
  };

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

  // Format ngày tháng
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  if (loading) {
    return <Loader size="lg" text="Đang tải thông tin đơn hàng..." />;
  }

  if (error) {
    return <Message variant="error">{error}</Message>;
  }

  if (!order) {
    return <Message variant="error">Không tìm thấy đơn hàng</Message>;
  }

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Chi tiết đơn hàng (Admin)</h1>
        <div>
          <Link
            to="/admin/orders"
            className="text-indigo-600 hover:text-indigo-800 mr-4"
          >
            Quay lại danh sách đơn hàng
          </Link>
        </div>
      </div>

      {deliverSuccess && (
        <Message variant="success" className="mb-4">
          Đơn hàng đã được cập nhật thành công
        </Message>
      )}

      {deliverError && (
        <Message variant="error" className="mb-4">
          {deliverError}
        </Message>
      )}

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
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">
              Mã đơn hàng: {order._id}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Thông tin đơn hàng</h3>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Khách hàng:</span> {order.user.name}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Email:</span> {order.user.email}
                </p>
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
            
            {/* Admin Actions */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="font-medium text-gray-800 mb-3">Thao tác quản trị</h3>
              <div className="flex flex-wrap gap-3">
                {order.isPaid && !order.isDelivered && !order.isCancelled && (
                  <button
                    onClick={markAsDeliveredHandler}
                    disabled={loadingDeliver}
                    className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {loadingDeliver ? <Loader size="sm" text="Đang xử lý..." /> : 'Đánh dấu đã giao hàng'}
                  </button>
                )}
                
                {!order.isPaid && (
                  <button
                    className="bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 transition-colors"
                    disabled
                  >
                    Chờ thanh toán
                  </button>
                )}

                {!order.isDelivered && !order.isCancelled && order.isPaid && (
                  <button
                    onClick={handleCancelOrder}
                    disabled={loadingCancel}
                    className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 ml-3"
                  >
                    {loadingCancel ? <Loader size="sm" text="Đang xử lý..." /> : 'Hủy đơn hàng'}
                  </button>
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
              
              {/* Trạng thái đơn hàng */}
              <div className="pt-4 mt-2">
                <div className="p-3 rounded-md bg-gray-50">
                  <h3 className="text-lg font-medium mb-2">Trạng thái đơn hàng</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${order.isPaid ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span>{order.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}</span>
                    </li>
                    <li className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${order.isDelivered ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      <span>{order.isDelivered ? 'Đã giao hàng' : 'Đang xử lý'}</span>
                    </li>
                    <li className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${order.isCancelled ? 'bg-red-500' : 'bg-gray-500'}`}></div>
                      <span>{order.isCancelled ? 'Đã hủy' : 'Chưa hủy'}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail; 