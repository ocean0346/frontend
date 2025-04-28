import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../app/store';
import { setFilters, resetFilters, ProductFilters } from '../features/products/productSlice';
import { fetchCategories, fetchProductCategories } from '../app/api';

// Define Category interface
interface Category {
  _id: string;
  name: string;
  description?: string;
}

const ProductFilter: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { filters } = useSelector((state: RootState) => state.products);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [minPrice, setMinPrice] = useState(filters.minPrice || 0);
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice || 1000);
  const [minRating, setMinRating] = useState(filters.minRating || 0);
  const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
  const [priceRange, setPriceRange] = useState<[number, number]>([minPrice, maxPrice]);

  // Lấy danh sách categories từ API
  useEffect(() => {
    const getCategories = async () => {
      try {
        const data = await fetchCategories();
        
        // Kiểm tra và chuyển đổi dữ liệu để phù hợp với component
        if (Array.isArray(data)) {
          setCategories(data);
        } else {
          console.error('Dữ liệu danh mục không hợp lệ:', data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        
        // Fallback: Lấy danh mục từ sản phẩm thay thế
        try {
          const productCategories = await fetchProductCategories();
          if (Array.isArray(productCategories)) {
            const formattedCategories = productCategories.map(cat => ({
              _id: cat,
              name: cat
            }));
            setCategories(formattedCategories);
          }
        } catch (fallbackError) {
          console.error('Error fetching product categories:', fallbackError);
        }
      }
    };
    
    getCategories();
  }, []);

  // Cập nhật giá trị từ filters Redux khi filters thay đổi
  useEffect(() => {
    setSelectedCategory(filters.category || '');
    setMinPrice(filters.minPrice || 0);
    setMaxPrice(filters.maxPrice || 1000);
    setMinRating(filters.minRating || 0);
    setPriceRange([filters.minPrice || 0, filters.maxPrice || 1000]);
  }, [filters.category, filters.minPrice, filters.maxPrice, filters.minRating]);

  // Xử lý khi thay đổi bộ lọc giá
  const handlePriceChange = (value: number, isMin: boolean) => {
    if (isMin) {
      setMinPrice(value);
      setPriceRange([value, priceRange[1]]);
    } else {
      setMaxPrice(value);
      setPriceRange([priceRange[0], value]);
    }
  };

  // Áp dụng bộ lọc
  const applyFilters = () => {
    const newFilters: ProductFilters = {
      ...filters,
      category: selectedCategory,
      minPrice,
      maxPrice,
      minRating
    };
    
    dispatch(setFilters(newFilters));
  };

  // Reset bộ lọc
  const handleResetFilters = () => {
    dispatch(resetFilters());
    setMinPrice(0);
    setMaxPrice(1000);
    setMinRating(0);
    setSelectedCategory('');
    setPriceRange([0, 1000]);
  };

  // Hiển thị các sao theo rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`h-5 w-5 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-1 text-sm text-gray-600">
          {rating === 0 ? 'Tất cả' : `${rating} sao trở lên`}
        </span>
      </div>
    );
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h3 className="text-lg font-semibold mb-4">Bộ lọc sản phẩm</h3>
      
      {/* Category filter */}
      <div className="mb-4">
        <h4 className="font-medium mb-2">Danh mục sản phẩm</h4>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((category) => (
            <option key={category._id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      
      {/* Price filter */}
      <div className="mb-4">
        <h4 className="font-medium mb-2">Khoảng giá</h4>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">${minPrice}</span>
          <span className="text-sm text-gray-600">${maxPrice}</span>
        </div>
        <div className="relative mb-4">
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="absolute h-2 bg-indigo-600 rounded-full"
              style={{
                left: `${(minPrice / 1000) * 100}%`,
                width: `${((maxPrice - minPrice) / 1000) * 100}%`,
              }}
            ></div>
          </div>
        </div>
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="text-sm text-gray-600 block mb-1">Từ</label>
            <input
              type="number"
              min="0"
              max="1000"
              value={minPrice}
              onChange={(e) => handlePriceChange(Number(e.target.value), true)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="flex-1">
            <label className="text-sm text-gray-600 block mb-1">Đến</label>
            <input
              type="number"
              min="0"
              max="1000"
              value={maxPrice}
              onChange={(e) => handlePriceChange(Number(e.target.value), false)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>
      
      {/* Rating filter */}
      <div className="mb-6">
        <h4 className="font-medium mb-2">Đánh giá</h4>
        <div className="space-y-2">
          {[0, 1, 2, 3, 4, 5].map((rating) => (
            <label key={rating} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="rating"
                checked={minRating === rating}
                onChange={() => setMinRating(rating)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 mr-2"
              />
              {renderStars(rating)}
            </label>
          ))}
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex space-x-2">
        <button
          onClick={applyFilters}
          className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Áp dụng
        </button>
        <button
          onClick={handleResetFilters}
          className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
        >
          Đặt lại
        </button>
      </div>
    </div>
  );
};

export default ProductFilter; 