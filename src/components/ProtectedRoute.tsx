
import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { checkPermission } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles = ['admin', 'user', 'staff'] }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log("Người dùng chưa xác thực, chuyển hướng đến trang đăng nhập");
      } else if (!checkPermission(user, allowedRoles)) {
        console.log(`Người dùng ${user.username} không có quyền truy cập, vai trò: ${user.role}, cần: ${allowedRoles.join(', ')}`);
      }
    }
  }, [user, loading, allowedRoles]);

  if (loading) {
    // Hiển thị trạng thái đang tải
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Đang tải...</div>
      </div>
    );
  }

  if (!user) {
    // Chuyển hướng đến đăng nhập nếu chưa xác thực
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!checkPermission(user, allowedRoles)) {
    // Chuyển hướng đến trang không có quyền truy cập
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // Hiển thị nội dung nếu đã xác thực và có quyền
  return <>{children}</>;
};

export default ProtectedRoute;
