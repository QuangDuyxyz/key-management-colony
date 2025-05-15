
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import Login from "@/pages/Login";
import DashboardHome from "@/pages/dashboard/DashboardHome";
import DevicesPage from "@/pages/dashboard/DevicesPage";
import KeysPage from "@/pages/dashboard/KeysPage";
import LogsPage from "@/pages/dashboard/LogsPage";
import UsersPage from "@/pages/dashboard/UsersPage";
import UnauthorizedPage from "@/pages/UnauthorizedPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Chuyển hướng trang gốc đến dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Trang công khai */}
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            {/* Các tuyến đường bảo vệ */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<DashboardHome />} />
              <Route path="keys" element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <KeysPage />
                </ProtectedRoute>
              } />
              <Route path="devices" element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <DevicesPage />
                </ProtectedRoute>
              } />
              <Route path="logs" element={<LogsPage />} />
              <Route path="users" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UsersPage />
                </ProtectedRoute>
              } />
            </Route>
            
            {/* Trang 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
