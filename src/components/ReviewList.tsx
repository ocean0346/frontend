import { formatInTimeZone } from 'date-fns-tz';
import { vi } from 'date-fns/locale';
import Rating from './Rating';

interface Review {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewListProps {
  reviews: Review[];
}

const ReviewList: React.FC<ReviewListProps> = ({ reviews }) => {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">Chưa có đánh giá nào cho sản phẩm này.</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return formatInTimeZone(
        new Date(dateString),
        'Asia/Ho_Chi_Minh',
        'dd/MM/yyyy HH:mm'
      );
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review._id} className="border-b border-gray-200 pb-6 last:border-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold mr-3">
                {review.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="font-medium">{review.name}</h4>
                <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
              </div>
            </div>
            <Rating value={review.rating} />
          </div>
          <p className="text-gray-700 whitespace-pre-line">{review.comment}</p>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;