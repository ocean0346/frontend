import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { fetchProducts, setFiltersAndFetch, setPageAndFetch } from '../features/products/productSlice';
import ProductCard from '../components/ProductCard';
import ProductFilter from '../components/ProductFilter';
import ProductCarousel from '../components/ProductCarousel';
import SearchBox from '../components/SearchBox';
import Message from '../components/Message';
import Loader from '../components/Loader';
import Pagination from '../components/Pagination';

const ProductsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { keyword } = useParams<{ keyword: string }>();
  const location = useLocation();
  
  const { products, loading, error, filters, page, pages, totalProducts } = useSelector(
    (state: RootState) => state.products
  );

  // State cho sản phẩm đề xuất
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);
  
  // Ref để kiểm soát vòng đời
  const isFirstRender = useRef(true);
  const prevKeyword = useRef<string | undefined>(keyword);
  const prevCategory = useRef<string | undefined>(filters.category);

  // Xử lý thay đổi tham số từ URL (category từ query params và keyword từ URL params)
  useEffect(() => {
    // Clone filters hiện tại để tránh gây ra vòng lặp từ dependency
    const currentFilters = { ...filters };
    
    if (isFirstRender.current) {
      isFirstRender.current = false;
      
      // Xử lý khi trang được load lần đầu
      const searchParams = new URLSearchParams(location.search);
      const categoryParam = searchParams.get('category');
      
      const updatedFilters = { ...currentFilters };
      
      // Nếu có keyword trong URL
      if (keyword) {
        try {
          // Decode keyword từ URL
          const decodedKeyword = decodeURIComponent(keyword);
          console.log('ProductsPage: Khởi tạo từ khóa từ URL (đã decode):', decodedKeyword);
          updatedFilters.keyword = decodedKeyword;
        } catch (error) {
          console.error('ProductsPage: Lỗi khi decode keyword từ URL:', error);
          // Nếu lỗi, sử dụng keyword gốc
          updatedFilters.keyword = keyword;
        }
      }
      
      // Nếu có category trong query params
      if (categoryParam) {
        console.log('ProductsPage: Khởi tạo danh mục từ URL:', categoryParam);
        updatedFilters.category = categoryParam;
      }
      
      // Chỉ dispatch một lần duy nhất nếu thực sự cần thay đổi filters
      if (updatedFilters.keyword !== currentFilters.keyword || updatedFilters.category !== currentFilters.category) {
        dispatch(setFiltersAndFetch(updatedFilters));
      } else {
        // Nếu không cần cập nhật filters, vẫn cần fetch sản phẩm
        dispatch(fetchProducts({ filters: currentFilters, page }));
      }
      
      return; // Thoát sớm, không cần xử lý những đoạn bên dưới trong lần render đầu tiên
    }
    
    // Xử lý thay đổi category
    const searchParams = new URLSearchParams(location.search);
    const categoryParam = searchParams.get('category');
    
    if (categoryParam !== prevCategory.current) {
      console.log('ProductsPage: Thay đổi danh mục từ', prevCategory.current, 'thành', categoryParam);
      prevCategory.current = categoryParam || undefined;
      
      // Sử dụng setFiltersAndFetch thay vì setFilters
      dispatch(setFiltersAndFetch({ ...currentFilters, category: categoryParam || '' }));
    }
    
    // Xử lý thay đổi keyword
    if (keyword !== prevKeyword.current) {
      console.log('ProductsPage: Thay đổi từ khóa từ', prevKeyword.current, 'thành', keyword);
      prevKeyword.current = keyword;
      
      try {
        // Decode keyword từ URL
        const decodedKeyword = keyword ? decodeURIComponent(keyword) : '';
        console.log('ProductsPage: Từ khóa sau khi decode:', decodedKeyword);
        
        // Sử dụng setFiltersAndFetch thay vì setFilters
        dispatch(setFiltersAndFetch({ ...currentFilters, keyword: decodedKeyword }));
      } catch (error) {
        console.error('ProductsPage: Lỗi khi decode keyword:', error);
        // Fallback sử dụng keyword gốc nếu có lỗi
        dispatch(setFiltersAndFetch({ ...currentFilters, keyword: keyword || '' }));
      }
    }
  }, [keyword, location.search, dispatch, page]);

  // Tạo sản phẩm khuyến nghị từ tất cả sản phẩm
  useEffect(() => {
    if (products && products.length > 0) {
      // Lọc các sản phẩm khác với danh mục hiện tại hoặc xáo trộn danh sách nếu không có lọc
      let recommended = [...products];
      
      // Nếu đang xem theo danh mục, ưu tiên hiển thị các sản phẩm cùng danh mục nhưng không trùng với danh sách đang hiển thị
      if (filters.category) {
        recommended = recommended
          .filter(product => product.category === filters.category)
          .slice(0, 8);
      } else {
        // Xáo trộn mảng để hiển thị ngẫu nhiên
        recommended = recommended
          .sort(() => 0.5 - Math.random())
          .slice(0, 8);
      }
      
      setRecommendedProducts(recommended);
    }
  }, [products, filters.category]);

  // Xử lý tìm kiếm
  const handleSearch = (searchKeyword: string) => {
    console.log('ProductsPage: Tìm kiếm với từ khóa:', searchKeyword);
    dispatch(setFiltersAndFetch({ ...filters, keyword: searchKeyword }));
  };

  // Xử lý chuyển trang
  const handlePageChange = (newPage: number) => {
    console.log('ProductsPage: Chuyển trang từ', page, 'sang', newPage);
    dispatch(setPageAndFetch(newPage));
  };

  return (
    <div className="py-6">
      <h1 className="text-3xl font-bold mb-6">
        {filters.category ? `Sản phẩm: ${filters.category}` : 'Tất cả sản phẩm'}
      </h1>
      
      <div className="mb-6">
        <SearchBox setKeyword={handleSearch} redirect={false} className="max-w-xl mx-auto" />
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Bộ lọc */}
        <div className="md:w-1/4">
          <ProductFilter />
        </div>
        
        {/* Danh sách sản phẩm */}
        <div className="md:w-3/4">
          {loading ? (
            <Loader size="lg" text="Đang tải sản phẩm..." />
          ) : error ? (
            <Message variant="error">{error}</Message>
          ) : products.length === 0 ? (
            <Message variant="info">
              {filters.category
                ? `Không tìm thấy sản phẩm nào trong danh mục "${filters.category}"`
                : filters.keyword
                ? `Không tìm thấy sản phẩm nào khớp với "${filters.keyword}"`
                : 'Không tìm thấy sản phẩm nào'}
            </Message>
          ) : (
            <>
              <div className="mb-4 flex justify-between items-center">
                <p className="text-gray-600">
                  Hiển thị {products.length} trên {totalProducts} sản phẩm
                </p>
                <div className="flex items-center">
                  <span className="mr-2 text-gray-600">Sắp xếp theo:</span>
                  <select 
                    className="border border-gray-300 rounded-md p-2"
                    onChange={(e) => {
                      // TODO: Thêm sắp xếp sản phẩm
                    }}
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="price-asc">Giá: Thấp đến cao</option>
                    <option value="price-desc">Giá: Cao đến thấp</option>
                    <option value="rating">Đánh giá</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              
              {pages > 1 && (
                <div className="mt-8">
                  <Pagination 
                    currentPage={page} 
                    totalPages={pages} 
                    onPageChange={handlePageChange} 
                  />
                </div>
              )}
              
              {/* Sản phẩm đề xuất */}
              {recommendedProducts.length > 0 && (
                <div className="mt-16">
                  <ProductCarousel 
                    products={recommendedProducts}
                    title="Sản phẩm bạn có thể thích"
                    slidesPerView={3}
                    autoplayDelay={4000}
                    pauseOnInteraction={true}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage; 