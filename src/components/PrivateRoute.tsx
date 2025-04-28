import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';

interface Props {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<Props> = ({ children }) => {
  const { user } = useSelector((state: RootState) => state.auth);

  // Kiểm tra nếu người dùng đã đăng nhập
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

export default PrivateRoute; 