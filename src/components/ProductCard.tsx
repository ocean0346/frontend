import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Product } from '../types';
import { addToCart } from '../features/cart/cartSlice';
import { AppDispatch } from '../app/store';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isAdding, setIsAdding] = useState(false);

  const addToCartHandler = () => {
    setIsAdding(true);
    
    // Thêm vào giỏ hàng
    dispatch(
      addToCart({
        ...product,
        qty: 1,
      })
    );
    
    // Hiệu ứng hoàn thành sau 1 giây
    setTimeout(() => {
      setIsAdding(false);
    }, 1000);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 relative">
      {isAdding && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-10">
          <div className="bg-white rounded-md p-2 shadow-lg transform transition-transform animate-bounce">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}
      
      <Link to={`/product/${product._id}`}>
        <img
          src={"https://backend-3e21.onrender.com" + product.image }
          alt={product.name}
          className="w-full h-64 object-cover"
        />
      </Link>

      <div className="p-4">
        <Link to={`/product/${product._id}`}>
          <h3 className="text-lg font-semibold text-gray-800 hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex justify-between items-center">
          <span className="text-xl font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </span>
          
          {product.countInStock > 0 ? (
            <button 
              onClick={addToCartHandler}
              disabled={isAdding}
              className={`${
                isAdding 
                  ? 'bg-green-600' 
                  : 'bg-indigo-600 hover:bg-indigo-700'
              } text-white px-3 py-1 rounded transition-colors flex items-center`}
            >
              {isAdding ? (
                <>
                  <span>Đã thêm</span>
                </>
              ) : (
                'Thêm vào giỏ'
              )}
            </button>
          ) : (
            <span className="px-3 py-1 text-sm text-red-600 font-medium">
              Hết hàng
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 