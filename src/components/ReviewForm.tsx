import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../app/store';
import { createProductReview } from '../features/products/productSlice';
import Message from './Message';
import Loader from './Loader';

interface ReviewFormProps {
  productId: string;
  onSuccess?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productId, onSuccess }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Vui lòng chọn đánh giá');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      await dispatch(createProductReview({ 
        productId, 
        review: { rating, comment } 
      })).unwrap();
      
      setSuccess(true);
      setRating(0);
      setComment('');
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Tự động ẩn thông báo thành công sau 3 giây
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi gửi đánh giá');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarClick = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleStarHover = (hoveredRating: number) => {
    setHoverRating(hoveredRating);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Đánh giá sản phẩm</h3>
      
      {error && (
        <Message variant="error" onClose={() => setError(null)}>
          {error}
        </Message>
      )}
      
      {success && (
        <Message variant="success">
          Cảm ơn bạn đã gửi đánh giá!
        </Message>
      )}
      
      <form onSubmit={submitHandler}>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Đánh giá
          </label>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleStarClick(star)}
                onMouseEnter={() => handleStarHover(star)}
                onMouseLeave={handleStarLeave}
                className="focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-8 w-8 ${
                    (hoverRating || rating) >= star
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  } transition-colors`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
            <span className="ml-2 text-gray-600 self-center">
              {rating > 0 ? `${rating} sao` : 'Chưa đánh giá'}
            </span>
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="comment" className="block text-gray-700 font-medium mb-2">
            Nhận xét
          </label>
          <textarea
            id="comment"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Chia sẻ nhận xét của bạn về sản phẩm này..."
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <Loader size="sm" color="white" />
              <span className="ml-2">Đang gửi...</span>
            </>
          ) : (
            'Gửi đánh giá'
          )}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm; 