import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../app/store';
import { saveShippingAddress, savePaymentMethod, clearCartItems } from '../features/cart/cartSlice';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { createOrder } from '../app/api';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { cartItems, shippingAddress, paymentMethod } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.auth);

  // Các bước thanh toán: 1-Thông tin giao hàng, 2-Phương thức thanh toán, 3-Xác nhận đơn hàng
  const [activeStep, setActiveStep] = useState(1);
  
  // Form shipping
  const [address, setAddress] = useState(shippingAddress?.address || '');
  const [city, setCity] = useState(shippingAddress?.city || '');
  const [postalCode, setPostalCode] = useState(shippingAddress?.postalCode || '');
  const [country, setCountry] = useState(shippingAddress?.country || '');
  const [phoneNumber, setPhoneNumber] = useState(shippingAddress?.phoneNumber || '');
  
  // Phương thức thanh toán
  const [paymentMethodOption, setPaymentMethodOption] = useState(paymentMethod || 'PayPal');
  
  // Thông báo lỗi
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Kiểm tra đăng nhập và giỏ hàng có sản phẩm
  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=checkout');
    }
    
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [user, cartItems, navigate]);

  // Chuyển bước: Giao hàng -> Thanh toán
  const submitShippingHandler = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address || !city || !postalCode || !country || !phoneNumber) {
      setError('Vui lòng điền đầy đủ thông tin giao hàng');
      return;
    }
    
    // Lưu thông tin giao hàng
    dispatch(saveShippingAddress({
      address,
      city,
      postalCode,
      country,
      phoneNumber,
    }));
    
    // Chuyển sang bước thanh toán
    setActiveStep(2);
    setError(null);
  };

  // Chuyển bước: Thanh toán -> Xác nhận đơn hàng
  const submitPaymentHandler = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Lưu phương thức thanh toán
    dispatch(savePaymentMethod(paymentMethodOption));
    
    // Chuyển sang bước xác nhận đơn hàng
    setActiveStep(3);
  };

  // Hoàn tất đơn hàng
  const placeOrderHandler = async () => {
    setLoading(true);
    
    try {
      // Tạo đối tượng đơn hàng để gửi đến API
      const orderData = {
        orderItems: cartItems.map(item => ({
          name: item.name,
          qty: item.qty,
          image: item.image,
          price: item.price,
          product: item._id
        })),
        shippingAddress,
        paymentMethod: paymentMethodOption,
        totalPrice: total
      };
      
      console.log('Đang gửi dữ liệu đặt hàng:', JSON.stringify(orderData));
      console.log('Thông tin người dùng:', JSON.stringify(user));
      
      // Gọi API để tạo đơn hàng
      const createdOrder = await createOrder(orderData);
      console.log('Đơn hàng đã được tạo:', JSON.stringify(createdOrder));
      
      // Xóa giỏ hàng sau khi đặt hàng thành công
      dispatch(clearCartItems());
      
      // Chuyển đến trang thành công
      setLoading(false);
      navigate('/order-success');
    } catch (error: any) {
      console.error('Lỗi khi đặt hàng:', error);
      console.error('Chi tiết lỗi:', error.response?.data || error.message);
      setError(error.response?.data?.message || error.message || 'Đặt hàng không thành công. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  // Tính toán tổng tiền
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shipping = subtotal > 0 ? (subtotal < 500 ? 10 : 0) : 0;
  const tax = subtotal * 0.1; // Thuế 10%
  const total = subtotal + shipping + tax;
  
  // Hiển thị bước thanh toán hiện tại
  const renderStep = () => {
    switch (activeStep) {
      case 1:
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Thông tin giao hàng</h2>
            {error && <Message variant="error">{error}</Message>}
            <form onSubmit={submitShippingHandler}>
              <div className="mb-4">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  id="address"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Nhập địa chỉ của bạn"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    Thành phố
                  </label>
                  <input
                    type="text"
                    id="city"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Nhập thành phố"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                    Mã bưu điện
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Nhập mã bưu điện"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    Quốc gia
                  </label>
                  <input
                    type="text"
                    id="country"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Nhập quốc gia"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Nhập số điện thoại"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Tiếp tục
                </button>
              </div>
            </form>
          </div>
        );
      
      case 2:
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Phương thức thanh toán</h2>
            <form onSubmit={submitPaymentHandler}>
              <div className="mb-4">
                <label className="flex items-center mb-4">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="PayPal"
                    checked={paymentMethodOption === 'PayPal'}
                    onChange={(e) => setPaymentMethodOption(e.target.value)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-2">PayPal hoặc Thẻ tín dụng</span>
                </label>
                
                <label className="flex items-center mb-4">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CreditCard"
                    checked={paymentMethodOption === 'CreditCard'}
                    onChange={(e) => setPaymentMethodOption(e.target.value)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-2">Thẻ tín dụng/ghi nợ</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethodOption === 'COD'}
                    onChange={(e) => setPaymentMethodOption(e.target.value)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-2">Thanh toán khi nhận hàng (COD)</span>
                </label>
              </div>
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Tiếp tục
                </button>
              </div>
            </form>
          </div>
        );
        
      case 3:
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Xác nhận đơn hàng</h2>
            {error && <Message variant="error">{error}</Message>}
            
            <div className="border-b border-gray-200 pb-4 mb-4">
              <h3 className="text-lg font-medium mb-2">Thông tin giao hàng</h3>
              <p className="text-gray-600">
                <strong>Địa chỉ:</strong> {address}, {city}, {postalCode}, {country}
              </p>
              <p className="text-gray-600">
                <strong>Số điện thoại:</strong> {phoneNumber}
              </p>
            </div>
            
            <div className="border-b border-gray-200 pb-4 mb-4">
              <h3 className="text-lg font-medium mb-2">Phương thức thanh toán</h3>
              <p className="text-gray-600">
                <strong>Phương thức:</strong> {paymentMethodOption}
              </p>
            </div>
            
            <div className="border-b border-gray-200 pb-4 mb-4">
              <h3 className="text-lg font-medium mb-2">Sản phẩm đặt mua</h3>
              {cartItems.map(item => (
                <div key={item._id} className="flex items-center py-2 border-b border-gray-100">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                  <div className="ml-4 flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-gray-600">{item.qty} x ${item.price.toFixed(2)} = ${(item.qty * item.price).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Tổng đơn hàng</h3>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Tạm tính:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Phí vận chuyển:</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Thuế (10%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 font-bold">
                <span>Tổng cộng:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={placeOrderHandler}
                disabled={loading}
                className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors flex items-center"
              >
                {loading ? <Loader size="sm" text="Đang xử lý..." /> : 'Đặt hàng'}
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>
      
      {/* Hiển thị các bước thanh toán */}
      <div className="flex justify-between mb-8">
        <div className={`flex-1 text-center ${activeStep >= 1 ? 'text-indigo-600 font-semibold' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center mb-2 ${activeStep >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
            1
          </div>
          <span>Thông tin giao hàng</span>
        </div>
        <div className={`h-0.5 flex-1 self-center mt-0 mb-10 ${activeStep >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
        <div className={`flex-1 text-center ${activeStep >= 2 ? 'text-indigo-600 font-semibold' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center mb-2 ${activeStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
            2
          </div>
          <span>Phương thức thanh toán</span>
        </div>
        <div className={`h-0.5 flex-1 self-center mt-0 mb-10 ${activeStep >= 3 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
        <div className={`flex-1 text-center ${activeStep >= 3 ? 'text-indigo-600 font-semibold' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center mb-2 ${activeStep >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
            3
          </div>
          <span>Xác nhận đơn hàng</span>
        </div>
      </div>
      
      {/* Hiển thị biểu mẫu theo bước */}
      <div className="max-w-3xl mx-auto">
        {renderStep()}
      </div>
    </div>
  );
};

export default CheckoutPage; 