import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { addToCart, removeFromCart } from '../features/cart/cartSlice';
import Message from '../components/Message';
import Loader from '../components/Loader';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { cartItems, loading } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});

  // Khởi tạo state số lượng sản phẩm từ giỏ hàng
  useEffect(() => {
    const quantities: Record<string, number> = {};
    cartItems.forEach(item => {
      quantities[item._id] = item.qty;
    });
    setItemQuantities(quantities);
  }, [cartItems]);

  // Tính tổng tiền
  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shipping = subtotal > 0 ? (subtotal < 500 ? 10 : 0) : 0;
  const total = subtotal + shipping;

  const updateQtyHandler = (id: string, qty: number) => {
    // Cập nhật state local trước để UI phản hồi ngay lập tức
    setItemQuantities(prev => ({ ...prev, [id]: qty }));
    
    const item = cartItems.find((x) => x._id === id);
    if (item) {
      dispatch(addToCart({ ...item, qty }));
    }
  };

  const removeFromCartHandler = (id: string) => {
    // Hiệu ứng xóa item
    const itemElement = document.getElementById(`cart-item-${id}`);
    if (itemElement) {
      itemElement.classList.add('opacity-50', 'transition-opacity');
      setTimeout(() => {
        dispatch(removeFromCart(id));
      }, 300);
    } else {
      dispatch(removeFromCart(id));
    }
  };

  const checkoutHandler = () => {
    if (user) {
      navigate('/checkout');
    } else {
      navigate('/login?redirect=checkout');
    }
  };

  // Tính phần trăm để hiển thị tiến trình miễn phí vận chuyển
  const freeShippingProgress = Math.min((subtotal / 500) * 100, 100);

  return (
    <div className="py-6">
      <h1 className="text-3xl font-bold mb-8 pb-4 border-b border-gray-200">Giỏ hàng của bạn</h1>

      {loading && <Loader size="md" text="Đang cập nhật giỏ hàng..." />}

      {cartItems.length === 0 ? (
        <div className="text-center py-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h2 className="mt-4 text-xl font-medium">Giỏ hàng của bạn đang trống</h2>
          <p className="mt-2 text-gray-500">Thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
          <Link
            to="/"
            className="mt-6 inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sản phẩm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Đơn giá
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số lượng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thành tiền
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <tr key={item._id} id={`cart-item-${item._id}`} className="transition-all duration-300 hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-16 w-16 flex-shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-16 w-16 object-cover rounded"
                            />
                          </div>
                          <div className="ml-4">
                            <Link
                              to={`/product/${item._id}`}
                              className="text-sm font-medium text-gray-900 hover:text-indigo-600"
                            >
                              {item.name}
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${item.price.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center border border-gray-300 rounded-md w-24">
                          <button 
                            onClick={() => updateQtyHandler(item._id, Math.max(1, itemQuantities[item._id] - 1))} 
                            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                            disabled={itemQuantities[item._id] <= 1}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={item.countInStock}
                            value={itemQuantities[item._id] || item.qty}
                            onChange={(e) => {
                              const newQty = Math.min(
                                Math.max(1, parseInt(e.target.value) || 1),
                                item.countInStock
                              );
                              updateQtyHandler(item._id, newQty);
                            }}
                            className="w-10 text-center border-0 focus:outline-none"
                          />
                          <button 
                            onClick={() => updateQtyHandler(item._id, Math.min(item.countInStock, itemQuantities[item._id] + 1))} 
                            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                            disabled={itemQuantities[item._id] >= item.countInStock}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${(item.price * item.qty).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => removeFromCartHandler(item._id)}
                          className="text-red-600 hover:text-red-800 flex items-center justify-end"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-lg font-semibold mb-4 pb-4 border-b border-gray-200">
                Thông tin đơn hàng
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Số lượng sản phẩm:</span>
                  <span className="font-medium">{totalItems}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tạm tính:</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phí vận chuyển:</span>
                  <span className="font-medium">
                    {shipping === 0 ? (
                      <span className="text-green-600">Miễn phí</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                
                {shipping > 0 && subtotal > 0 && (
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">
                        Thêm ${(500 - subtotal).toFixed(2)} nữa để được miễn phí vận chuyển
                      </span>
                      <span className="font-medium text-green-600">
                        {freeShippingProgress.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-green-600 h-2.5 rounded-full transition-all duration-500" 
                        style={{ width: `${freeShippingProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {shipping === 0 && subtotal > 0 && (
                  <Message variant="success">
                    Bạn đã được miễn phí vận chuyển!
                  </Message>
                )}
                
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">Tổng tiền:</span>
                    <span className="text-xl font-bold text-indigo-600">${total.toFixed(2)}</span>
                  </div>
                </div>
                
                <button
                  onClick={checkoutHandler}
                  disabled={cartItems.length === 0}
                  className={`mt-6 w-full py-3 px-4 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors ${
                    cartItems.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Tiến hành thanh toán
                </button>
                
                <Link
                  to="/"
                  className="mt-3 block text-center text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Tiếp tục mua sắm
                </Link>
                
                <div className="mt-4 text-xs text-gray-500">
                  <p className="mb-1">Chấp nhận thanh toán:</p>
                  <div className="flex space-x-2">
                    <div className="bg-gray-100 p-1 rounded">Visa</div>
                    <div className="bg-gray-100 p-1 rounded">Mastercard</div>
                    <div className="bg-gray-100 p-1 rounded">PayPal</div>
                    <div className="bg-gray-100 p-1 rounded">COD</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage; 