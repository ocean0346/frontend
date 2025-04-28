import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../app/store';
import { fetchProductDetails, updateProduct } from '../../features/products/productSlice';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import { uploadImage, fetchCategories, fetchProductCategories } from '../../app/api';

// Danh sách thương hiệu mẫu
const BRANDS = [
  'Apple',
  'Samsung',
  'Sony',
  'LG',
  'Xiaomi',
  'Dell',
  'HP',
  'Lenovo',
  'Asus',
  'Acer',
  'Nike',
  'Adidas',
  'Puma',
  'Converse',
  'Other'
];

// Interface cho Category
interface Category {
  _id: string;
  name: string;
  description?: string;
}

const AdminProductEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
  // State cho danh mục và thương hiệu
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoryError, setCategoryError] = useState('');

  const { product, loading, error } = useSelector(
    (state: RootState) => state.products
  );

  // Lấy danh sách danh mục khi component mount
  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true);
      try {
        const categoriesData = await fetchCategories();
        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData);
        } else {
          // Nếu không phải mảng, thử lấy danh mục từ sản phẩm
          try {
            const productCategories = await fetchProductCategories();
            if (Array.isArray(productCategories)) {
              const formattedCategories = productCategories.map(cat => ({
                _id: cat,
                name: cat
              }));
              setCategories(formattedCategories);
            }
          } catch (error) {
            console.error('Error fetching product categories:', error);
            setCategoryError('Không thể tải danh mục');
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategoryError('Không thể tải danh mục');
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    if (!id) return;
    
    if (!product || product._id !== id) {
      dispatch(fetchProductDetails(id));
    } else {
      setName(product.name);
      setPrice(product.price);
      setImage("https://backend-3e21.onrender.com" + product.image );
      setBrand(product.brand || '');
      setCategory(product.category || '');
      setCountInStock(product.countInStock);
      setDescription(product.description);
    }
  }, [dispatch, id, product]);

  const submitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;

    dispatch(
      updateProduct({
        id,
        productData: {
          name,
          price,
          image,
          brand,
          category,
          countInStock,
          description,
        },
      })
    ).then(() => {
      navigate('/admin/products');
    });
  };

  const uploadFileHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    setUploadError('');

    try {
      const data = await uploadImage(formData);
      console.log('Upload response:', data);
      if (data.imagePath) {
        setImage(data.imagePath);
        console.log('Image path set to:', data.imagePath);
      } else if (data.filePath) {
        setImage(data.filePath);
        console.log('Image path set to:', data.filePath);
      } else {
        throw new Error('Không nhận được đường dẫn ảnh từ server');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadError(error.response?.data?.message || 'Lỗi tải ảnh lên');
    } finally {
      setUploading(false);
    }
  };

  // Xử lý khi thêm thương hiệu mới
  const handleCustomBrand = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBrand(e.target.value);
  };

  return (
    <div>
      <Link to="/admin/products" className="mb-4 inline-block text-blue-600 hover:underline">
        <i className="fas fa-arrow-left mr-1"></i> Quay lại
      </Link>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Chỉnh sửa sản phẩm</h1>

        {loading ? (
          <Loader />
        ) : error ? (
          <Message variant="error">{error}</Message>
        ) : (
          <form onSubmit={submitHandler}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                Tên sản phẩm
              </label>
              <input
                type="text"
                id="name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="price" className="block text-gray-700 font-medium mb-2">
                Giá
              </label>
              <input
                type="number"
                id="price"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="image" className="block text-gray-700 font-medium mb-2">
                Hình ảnh
              </label>
              <input
                type="text"
                id="image"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                required
              />
              <div className="mt-2 flex items-center">
                <input
                  type="file"
                  id="image-file"
                  className="mr-4"
                  onChange={uploadFileHandler}
                />
                {uploading && <Loader size="sm" />}
              </div>
              {uploadError && <Message variant="error">{uploadError}</Message>}
              {image && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-1">Xem trước:</p>
                  <img 
                    src={image.startsWith('http') ? image : `https://backend-3e21.onrender.com${image}`} 
                    alt="Preview" 
                    className="w-32 h-32 object-cover border rounded" 
                  />
                </div>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="brand" className="block text-gray-700 font-medium mb-2">
                Thương hiệu
              </label>
              <div className="flex items-center gap-2">
                <select
                  id="brand"
                  className="w-2/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={BRANDS.includes(brand) ? brand : ''}
                  onChange={(e) => setBrand(e.target.value)}
                >
                  <option value="">-- Chọn thương hiệu --</option>
                  {BRANDS.map((brandOption) => (
                    <option key={brandOption} value={brandOption}>
                      {brandOption}
                    </option>
                  ))}
                  {!BRANDS.includes(brand) && brand && (
                    <option value={brand}>{brand}</option>
                  )}
                </select>
                <div className="w-1/3">
                  <input
                    type="text"
                    placeholder="Hoặc nhập thương hiệu khác"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={!BRANDS.includes(brand) ? brand : ''}
                    onChange={handleCustomBrand}
                  />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="category" className="block text-gray-700 font-medium mb-2">
                Danh mục
              </label>
              {loadingCategories ? (
                <Loader size="sm" />
              ) : categoryError ? (
                <div className="mb-2">
                  <Message variant="error">{categoryError}</Message>
                  <input
                    type="text"
                    className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Nhập tên danh mục"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <select
                    id="category"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                    {category && !categories.find(c => c.name === category) && (
                      <option value={category}>{category}</option>
                    )}
                  </select>
                </div>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="countInStock" className="block text-gray-700 font-medium mb-2">
                Số lượng trong kho
              </label>
              <input
                type="number"
                id="countInStock"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={countInStock}
                onChange={(e) => setCountInStock(Number(e.target.value))}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
                Mô tả
              </label>
              <textarea
                id="description"
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Cập nhật
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminProductEdit; 