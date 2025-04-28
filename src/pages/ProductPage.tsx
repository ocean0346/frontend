import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { fetchProductDetails, clearError } from '../features/products/productSlice';
import { addToCart } from '../features/cart/cartSlice';
import Message from '../components/Message';
import Loader from '../components/Loader';
import Rating from '../components/Rating';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const [qty, setQty] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  const { product, loading, error } = useSelector((state: RootState) => state.products);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductDetails(id));
    }
    
    // Cleanup
    return () => {
      dispatch(clearError());
    };
  }, [dispatch, id]);

  const addToCartHandler = () => {
    if (product) {
      dispatch(addToCart({ ...product, qty }));
      navigate('/cart');
    }
  };

  const refreshReviews = () => {
    if (id) {
      dispatch(fetchProductDetails(id));
    }
    setShowReviewForm(false);
  };

  if (loading) {
    return <Loader size="lg" text="Đang tải thông tin sản phẩm..." />;
  }

  if (error) {
    return (
      <Message 
        variant="error" 
        onClose={() => dispatch(clearError())}
      >
        {error}
      </Message>
    );
  }

  if (!product) {
    return <Message variant="info">Không tìm thấy sản phẩm</Message>;
  }

  return (
    <div className="py-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-8 flex items-center text-indigo-600 hover:text-indigo-800"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
        Quay lại
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Hình ảnh sản phẩm */}
        <div className="rounded-lg overflow-hidden shadow-md">
          <img
            src={"https://backend-3e21.onrender.com" + product.image }
            alt={product.name}
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Thông tin sản phẩm */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
          
          <div className="mb-4 flex items-center">
            <Rating 
              value={product.rating || 0} 
              text={`${product.numReviews || 0} đánh giá`} 
            />
          </div>
          
          <div className="flex items-center mb-4">
            {product.countInStock > 0 ? (
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Còn hàng
              </div>
            ) : (
              <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                Hết hàng
              </div>
            )}
            <span className="mx-3 text-gray-300">|</span>
            <span className="text-gray-600">Mã sản phẩm: {product._id}</span>
          </div>
          
          <div className="text-3xl font-bold text-indigo-600 mb-6">
            ${product.price.toFixed(2)}
          </div>
          
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Mô tả sản phẩm</h2>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>
          
          {product.countInStock > 0 ? (
            <div className="space-y-6">
              <div className="flex items-center">
                <span className="text-gray-700 mr-4">Số lượng</span>
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button 
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    disabled={qty <= 1}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <input 
                    type="number"
                    min="1"
                    max={product.countInStock}
                    value={qty}
                    onChange={(e) => {
                      const newQty = parseInt(e.target.value);
                      if (!isNaN(newQty) && newQty > 0 && newQty <= product.countInStock) {
                        setQty(newQty);
                      }
                    }}
                    className="w-12 text-center border-0 focus:outline-none"
                  />
                  <button 
                    onClick={() => setQty(Math.min(product.countInStock, qty + 1))}
                    disabled={qty >= product.countInStock}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
                <span className="ml-4 text-gray-500">
                  {product.countInStock} sản phẩm có sẵn
                </span>
              </div>
              
              <button
                onClick={addToCartHandler}
                className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
                Thêm vào giỏ hàng
              </button>
            </div>
          ) : (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center font-medium">
              Sản phẩm hiện đã hết hàng
            </div>
          )}
        </div>
      </div>
      
      {/* Đánh giá sản phẩm */}
      <div className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Đánh giá từ khách hàng</h2>
          {user && !showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Viết đánh giá
            </button>
          )}
        </div>
        
        {showReviewForm && (
          <div className="mb-8">
            <ReviewForm productId={product._id} onSuccess={refreshReviews} />
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow p-6">
          <ReviewList reviews={product.reviews || []} />
        </div>
      </div>
    </div>
  );
};

export default ProductPage;