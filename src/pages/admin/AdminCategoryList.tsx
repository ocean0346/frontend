import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../app/store';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import { fetchCategories, addCategory, deleteCategory } from '../../app/api';

// Định nghĩa interface cho Category
interface Category {
  _id: string;
  name: string;
  description: string;
}

const AdminCategoryList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await fetchCategories();
      
      // Kiểm tra và chuyển đổi dữ liệu nếu cần
      if (Array.isArray(data)) {
        // Nếu đã là mảng thì kiểm tra cấu trúc dữ liệu
        const validCategories = data.map(item => {
          // Nếu item là string thì chuyển thành object
          if (typeof item === 'string') {
            return {
              _id: item, // Sử dụng string làm _id tạm thời
              name: item,
              description: ''
            };
          }
          
          // Nếu là object nhưng không có _id
          if (typeof item === 'object' && !item._id) {
            return {
              ...item,
              _id: item.name || Math.random().toString()
            };
          }
          
          // Nếu là object đầy đủ
          return item;
        });
        
        setCategories(validCategories);
      } else {
        // Nếu không phải mảng, xử lý lỗi
        setError('Dữ liệu danh mục không hợp lệ');
      }
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    
    setLoading(true);
    try {
      const result = await addCategory({
        name: newCategory.trim(),
        description: newDescription.trim()
      });
      
      // Cập nhật state để hiển thị UI
      setCategories([...categories, result]);
      setNewCategory('');
      setNewDescription('');
      setShowAddModal(false);
    } catch (err: any) {
      setError(err.message || 'Không thể thêm danh mục');
    } finally {
      setLoading(false);
    }
  };

  const deleteHandler = (category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (categoryToDelete) {
      setLoading(true);
      try {
        await deleteCategory(categoryToDelete._id);
        
        // Cập nhật state để hiển thị UI
        setCategories(categories.filter(cat => cat._id !== categoryToDelete._id));
        setShowDeleteModal(false);
        setCategoryToDelete(null);
      } catch (err: any) {
        setError(err.message || 'Không thể xóa danh mục');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý danh mục sản phẩm</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          <i className="fas fa-plus mr-2"></i> Thêm danh mục
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
                    STT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên danh mục
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mô tả
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      Không có danh mục nào
                    </td>
                  </tr>
                ) : (
                  categories.map((category, index) => (
                    <tr key={category._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {category.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {category.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button
                          onClick={() => deleteHandler(category)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <i className="fas fa-trash"></i> Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Add Category Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                <h3 className="text-lg font-medium mb-4">Thêm danh mục mới</h3>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
                    Tên danh mục
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="category"
                    type="text"
                    placeholder="Nhập tên danh mục"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                    Mô tả
                  </label>
                  <textarea
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="description"
                    placeholder="Nhập mô tả danh mục"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded mr-2"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleAddCategory}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                    disabled={!newCategory.trim()}
                  >
                    Thêm
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                <h3 className="text-lg font-medium mb-4">Xác nhận xóa</h3>
                <p className="mb-6">Bạn có chắc chắn muốn xóa danh mục "{categoryToDelete?.name}"?</p>
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
        </>
      )}
    </div>
  );
};

export default AdminCategoryList; 