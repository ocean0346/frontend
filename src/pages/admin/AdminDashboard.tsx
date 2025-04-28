import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Quản trị hệ thống</h1>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Quản lý sản phẩm</h2>
          <p className="text-gray-600 mb-4">
            Thêm, sửa, xóa sản phẩm trong hệ thống
          </p>
          <Link
            to="/admin/products"
            className="inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Quản lý sản phẩm
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Quản lý danh mục</h2>
          <p className="text-gray-600 mb-4">
            Thêm, sửa, xóa danh mục sản phẩm
          </p>
          <Link
            to="/admin/categories"
            className="inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Quản lý danh mục
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Quản lý đơn hàng</h2>
          <p className="text-gray-600 mb-4">
            Xem và cập nhật trạng thái các đơn hàng
          </p>
          <Link
            to="/admin/orders"
            className="inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Quản lý đơn hàng
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Quản lý người dùng</h2>
          <p className="text-gray-600 mb-4">
            Xem và quản lý tài khoản người dùng
          </p>
          <Link
            to="/admin/users"
            className="inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Quản lý người dùng
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 