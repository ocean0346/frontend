import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { clearCartItems } from '../features/cart/cartSlice';

const OrderSuccessPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  // Kiểm tra đăng nhập
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
    
    // Xóa giỏ hàng sau khi đặt hàng thành công
    dispatch(clearCartItems());
  }, [user, navigate, dispatch]);

  return (
    <div className="max-w-lg mx-auto text-center py-12">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-green-100 p-4">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-16 w-16 text-green-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Đặt hàng thành công!</h1>
        
        <p className="text-gray-600 mb-8">
          Cảm ơn bạn đã đặt hàng. Chúng tôi đã nhận được đơn hàng của bạn và sẽ xử lý trong thời gian sớm nhất.
        </p>
        
        <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
          <p className="font-medium text-indigo-800">
            Một email xác nhận đơn hàng đã được gửi đến địa chỉ email của bạn.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/" 
            className="bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Tiếp tục mua sắm
          </Link>
          <Link 
            to="/profile/orders" 
            className="bg-white text-indigo-600 border border-indigo-600 py-3 px-6 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            Xem đơn hàng của tôi
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage; 