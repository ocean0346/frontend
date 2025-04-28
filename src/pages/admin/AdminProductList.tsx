import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../app/store';
import { fetchProducts, deleteProduct, createProduct } from '../../features/products/productSlice';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import { fetchCategories } from '../../app/api';
import { PayloadAction } from '@reduxjs/toolkit';

// Định nghĩa interface Product
interface Product {
  _id: string;
  name: string;
  image: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  countInStock: number;
  [key: string]: any; // Cho phép các thuộc tính khác
}

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

const AdminProductList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // State cho sản phẩm mới
  const [productName, setProductName] = useState('Sản phẩm mới');
  const [productBrand, setProductBrand] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [customBrand, setCustomBrand] = useState('');
  
  // State cho danh mục
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const { products, loading, error } = useSelector(
    (state: RootState) => state.products
  );

  useEffect(() => {
    dispatch(fetchProducts({}));
  }, [dispatch]);
  
  // Load danh sách danh mục khi cần hiển thị modal tạo sản phẩm
  useEffect(() => {
    if (showCreateModal) {
      loadCategories();
    }
  }, [showCreateModal]);
  
  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const data = await fetchCategories();
      if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const deleteHandler = (id: string) => {
    setProductToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      dispatch(deleteProduct(productToDelete));
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  const createProductHandler = () => {
    setShowCreateModal(true);
  };
  
  const confirmCreateProduct = () => {
    // Sử dụng custom brand nếu đã nhập, ngược lại dùng brand từ dropdown
    const finalBrand = customBrand || productBrand;
    
    dispatch(createProduct({
      name: productName,
      price: 0,
      image: '/uploads/sample.jpg',
      brand: finalBrand,
      category: productCategory,
      countInStock: 0,
      description: 'Mô tả sản phẩm'
    })).then((result) => {
      setShowCreateModal(false);
      
      // Kiểm tra kết quả và chuyển đến trang edit nếu thành công
      const action = result as unknown as { 
        meta: { requestStatus: string }, 
        payload: Product | undefined 
      };
      
      if (action.meta.requestStatus === 'fulfilled' && action.payload) {
        navigate(`/admin/product/${action.payload._id}/edit`);
      }
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
        <button
          onClick={createProductHandler}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          <i className="fas fa-plus mr-2"></i> Thêm sản phẩm
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="error">{error}</Message>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên sản phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Danh mục
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thương hiệu
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product._id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 mr-3">
                          <img
                            className="h-10 w-10 object-cover rounded"
                            src={"https://backend-3e21.onrender.com" + product.image }
                            alt={product.name}
                          />
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.price.toLocaleString()} đ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.brand}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <Link
                        to={`/admin/product/${product._id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <i className="fas fa-edit"></i> Sửa
                      </Link>
                      <button
                        onClick={() => deleteHandler(product._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <i className="fas fa-trash"></i> Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                <h3 className="text-lg font-medium mb-4">Xác nhận xóa</h3>
                <p className="mb-6">Bạn có chắc chắn muốn xóa sản phẩm này?</p>
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded mr-2"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="bg-red-600 text-white px-4 py-2 rounded"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Create Product Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                <h3 className="text-lg font-medium mb-4">Tạo sản phẩm mới</h3>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Tên sản phẩm
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Thương hiệu
                  </label>
                  <div className="flex gap-2">
                    <select
                      className="w-2/3 px-3 py-2 border rounded-lg"
                      value={productBrand}
                      onChange={(e) => setProductBrand(e.target.value)}
                    >
                      <option value="">-- Chọn thương hiệu --</option>
                      {BRANDS.map((brand) => (
                        <option key={brand} value={brand}>
                          {brand}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      className="w-1/3 px-3 py-2 border rounded-lg"
                      placeholder="Hoặc nhập mới"
                      value={customBrand}
                      onChange={(e) => setCustomBrand(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Danh mục
                  </label>
                  {loadingCategories ? (
                    <Loader size="sm" />
                  ) : (
                    <select
                      className="w-full px-3 py-2 border rounded-lg"
                      value={productCategory}
                      onChange={(e) => setProductCategory(e.target.value)}
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded mr-2"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={confirmCreateProduct}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                    disabled={!productName || (!productBrand && !customBrand) || !productCategory}
                  >
                    Tạo sản phẩm
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminProductList; 