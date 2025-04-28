import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, A11y } from 'swiper/modules';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import { Product } from '../types';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// Import custom styles
import './ProductCarousel.css';

interface ProductCarouselProps {
  products: Product[];
  title?: string;
  viewAllLink?: string;
  slidesPerView?: number;
  spaceBetween?: number;
  autoplayDelay?: number;
  pauseOnInteraction?: boolean;
  autoplayResumeDelay?: number;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({
  products,
  title,
  viewAllLink,
  slidesPerView = 4,
  spaceBetween = 20,
  autoplayDelay = 3000,
  pauseOnInteraction = true,
  autoplayResumeDelay = 5000
}) => {
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  const [autoplayTimeout, setAutoplayTimeout] = useState<NodeJS.Timeout | null>(null);
  const [carouselClass, setCarouselClass] = useState('product-carousel autoplay-active');

  // Xử lý khi người dùng tương tác với carousel
  const handleUserInteraction = () => {
    if (!pauseOnInteraction) return;
    
    // Dừng autoplay
    setAutoplayEnabled(false);
    setCarouselClass('product-carousel autoplay-paused');
    
    // Xóa timeout cũ nếu có
    if (autoplayTimeout) {
      clearTimeout(autoplayTimeout);
    }
    
    // Đặt timeout mới để kích hoạt lại autoplay sau một khoảng thời gian
    const timeout = setTimeout(() => {
      setAutoplayEnabled(true);
      setCarouselClass('product-carousel autoplay-active');
    }, autoplayResumeDelay);
    
    setAutoplayTimeout(timeout);
  };

  // Cập nhật animation cho autoplay progress
  useEffect(() => {
    if (autoplayEnabled) {
      // Cập nhật animation duration theo autoplayDelay
      document.documentElement.style.setProperty(
        '--autoplay-duration', 
        `${autoplayDelay}ms`
      );
    }
  }, [autoplayEnabled, autoplayDelay]);

  // Cleanup timeout khi component unmount
  useEffect(() => {
    return () => {
      if (autoplayTimeout) {
        clearTimeout(autoplayTimeout);
      }
    };
  }, [autoplayTimeout]);

  // Tính toán slidesPerView dựa trên kích thước màn hình
  const responsiveSlidesPerView = {
    320: { slidesPerView: 1, spaceBetween: 10 },
    640: { slidesPerView: 2, spaceBetween: 15 },
    768: { slidesPerView: 3, spaceBetween: 15 },
    1024: { slidesPerView: slidesPerView, spaceBetween: spaceBetween },
  };

  return (
    <div className={carouselClass} style={{'--autoplay-duration': `${autoplayDelay}ms`} as React.CSSProperties}>
      {/* Tiêu đề và link xem tất cả */}
      {(title || viewAllLink) && (
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="w-full md:w-auto mb-4 md:mb-0 mx-auto">
            {title && (
              <h2 className="text-2xl font-bold text-center relative pb-2 mx-auto">
                {title}
              </h2>
            )}
          </div>
          {viewAllLink && (
            <Link to={viewAllLink} className="text-indigo-600 hover:text-indigo-800 transition-colors flex items-center group">
              <span>Xem tất cả</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1 transform transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          )}
        </div>
      )}

      {/* Swiper Carousel */}
      <Swiper
        modules={[Autoplay, Pagination, Navigation, A11y]}
        spaceBetween={spaceBetween}
        slidesPerView={slidesPerView}
        navigation
        pagination={{ clickable: true }}
        loop={true}
        autoplay={
          autoplayEnabled
            ? {
                delay: autoplayDelay,
                disableOnInteraction: false,
              }
            : false
        }
        breakpoints={responsiveSlidesPerView}
        onTouchStart={handleUserInteraction}
        onTouchEnd={handleUserInteraction}
        onDragStart={handleUserInteraction}
        onDragEnd={handleUserInteraction}
        className="product-swiper"
      >
        {products.map((product) => (
          <SwiperSlide key={product._id} className="product-slide">
            <div className="px-2 py-4">
              <ProductCard product={product} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ProductCarousel; 