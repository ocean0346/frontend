import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { fetchProducts } from '../features/products/productSlice';
import ProductCard from '../components/ProductCard';
import ProductCarousel from '../components/ProductCarousel';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { fetchCategories } from '../app/api';
import { Product } from '../types';

// Interface cho Category
interface Category {
  _id: string;
  name: string;
  description?: string;
}

const HomePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { products, loading, error } = useSelector((state: RootState) => state.products);
  
  // State cho danh mục
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  
  // Sản phẩm theo danh mục
  const [productsByCategory, setProductsByCategory] = useState<{[key: string]: Product[]}>({});

  useEffect(() => {
    dispatch(fetchProducts({}));
    loadCategories();
  }, [dispatch]);
  
  // Nhóm sản phẩm theo danh mục khi products hoặc categories thay đổi
  useEffect(() => {
    if (products && products.length > 0 && categories.length > 0) {
      const groupedProducts: {[key: string]: Product[]} = {};
      
      // Khởi tạo mảng trống cho mỗi danh mục
      categories.forEach(category => {
        groupedProducts[category.name] = [];
      });
      
      // Phân nhóm sản phẩm vào các danh mục
      products.forEach(product => {
        if (product.category && groupedProducts[product.category]) {
          groupedProducts[product.category].push(product);
        }
      });
      
      setProductsByCategory(groupedProducts);
    }
  }, [products, categories]);
  
  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const data = await fetchCategories();
      if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch (error: any) {
      console.error('Error loading categories:', error);
      setCategoryError(error.message || 'Không thể tải danh mục');
    } finally {
      setLoadingCategories(false);
    }
  };

  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    
    if (name.includes('laptop') || name.includes('máy tính')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    } else if (name.includes('tivi') || name.includes('tv')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    } else if (name.includes('điện thoại') || name.includes('phone')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    } else {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      );
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16 mb-12 rounded-lg">
        <div className="container mx-auto text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Chào mừng đến với ShopNow</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Khám phá bộ sưu tập sản phẩm chất lượng cao với giá cả phải chăng
          </p>
          <Link to="/products" className="bg-white text-indigo-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-full shadow-lg transition-colors inline-block">
            Mua sắm ngay
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="mb-12">
        {loading ? (
          <Loader text="Đang tải sản phẩm..." />
        ) : error ? (
          <Message variant="error">{error}</Message>
        ) : products.length === 0 ? (
          <Message variant="info">Không tìm thấy sản phẩm nào</Message>
        ) : (
          <ProductCarousel 
            products={products.slice(0, 8)} 
            title="Sản phẩm nổi bật"
            viewAllLink="/products"
            slidesPerView={4}
            autoplayDelay={4000}
            pauseOnInteraction={true}
            autoplayResumeDelay={5000}
          />
        )}
      </section>

      {/* Categories Section */}
      <section className="mb-12">
        <div className="flex flex-col items-center mb-8">
          <h2 className="text-3xl font-bold text-center mb-3 relative pb-2">
            Danh mục sản phẩm
          </h2>
          <p className="text-gray-600 text-center max-w-2xl">Khám phá đa dạng các sản phẩm chất lượng cao theo danh mục</p>
          <Link to="/products" className="mt-2 text-indigo-600 hover:text-indigo-800 transition-colors flex items-center group">
            <span>Xem tất cả danh mục</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1 transform transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
        
        {loadingCategories ? (
          <Loader text="Đang tải danh mục..." />
        ) : categoryError ? (
          <Message variant="error">{categoryError}</Message>
        ) : categories.length === 0 ? (
          <Message variant="info">Không tìm thấy danh mục nào</Message>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {categories.slice(0, 6).map((category) => (
              <div 
                key={category._id} 
                className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-custom hover:shadow-custom-lg transition-all duration-300 cursor-pointer text-center hover-lift"
              >
                <div className="bg-indigo-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                  {getCategoryIcon(category.name)}
                </div>
                <h3 className="text-xl font-semibold mb-3">{category.name.toUpperCase()}</h3>
                <p className="text-gray-600 mb-4">
                  {category.description || `Khám phá các sản phẩm ${category.name} chất lượng cao`}
                </p>
                <Link 
                  to={`/products?category=${encodeURIComponent(category.name)}`} 
                  className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium group"
                >
                  <span>Xem ngay</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1 transform transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
      
      {/* Products by Category */}
      {Object.keys(productsByCategory).length > 0 && (
        <div className="space-y-16">
          {categories.map((category) => {
            const categoryProducts = productsByCategory[category.name] || [];
            if (categoryProducts.length === 0) return null;
            
            return (
              <section key={category._id} className="mb-12 text-center">
                <div className="mb-6 flex justify-center">
                  <h2 className="text-2xl font-bold uppercase">{category.name}</h2>
                </div>
                <ProductCarousel 
                  products={categoryProducts}
                  viewAllLink={`/products?category=${encodeURIComponent(category.name)}`}
                  slidesPerView={3}
                  autoplayDelay={5000}
                  pauseOnInteraction={true}
                />
              </section>
            );
          })}
        </div>
      )}

      {/* Newsletter */}
      <section className="bg-gray-100 rounded-lg p-8 mb-12">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Đăng ký nhận tin</h2>
          <p className="text-gray-600 mb-6">
            Nhận thông tin mới nhất về sản phẩm, khuyến mãi và ưu đãi đặc biệt.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input 
              type="email" 
              placeholder="Nhập địa chỉ email của bạn" 
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors">
              Đăng ký
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 