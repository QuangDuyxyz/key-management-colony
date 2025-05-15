
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const Index = () => {
  useEffect(() => {
    document.title = "Hệ thống quản lý key bản quyền";
  }, []);

  return <Navigate to="/dashboard" replace />;
};

export default Index;
