
import { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { SidebarProvider, Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarTrigger, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Key, Database, User, Users, FileText, LogOut, Settings } from 'lucide-react';
import { testConnection } from '@/lib/db';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dbStatus, setDbStatus] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Kiểm tra kết nối database
    const checkDbConnection = async () => {
      const result = await testConnection();
      setDbStatus(result);
    };
    
    checkDbConnection();
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar user={user} onLogout={handleLogout} dbStatus={dbStatus} />
        <div className="flex-1">
          <header className="h-16 border-b bg-white flex items-center px-6 sticky top-0 z-10">
            <SidebarTrigger />
            <div className="ml-auto flex items-center gap-4">
              <div className="text-sm font-medium flex items-center">
                <span className="bg-primary/10 text-primary px-2 py-1 rounded mr-2">
                  {user.role === 'admin' ? 'Quản trị viên' : 
                   user.role === 'staff' ? 'Nhân viên' : 'Người dùng'}
                </span>
                Xin chào, {user.username}
              </div>
            </div>
          </header>
          
          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

interface AppSidebarProps {
  user: { username: string; role: string };
  onLogout: () => void;
  dbStatus: boolean | null;
}

const AppSidebar = ({ user, onLogout, dbStatus }: AppSidebarProps) => {
  return (
    <Sidebar>
      <div className="p-4 flex items-center gap-2">
        <Key className="h-6 w-6 text-sidebar-primary" />
        <h1 className="font-bold text-lg text-sidebar-foreground">License Manager</h1>
      </div>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Quản lý</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/dashboard">
                    <Key className="sidebar-icon" />
                    <span>Bảng điều khiển</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {/* Hiển thị menu theo quyền */}
              {(user.role === 'admin' || user.role === 'staff') && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/dashboard/keys">
                        <Database className="sidebar-icon" />
                        <span>Quản lý key</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/dashboard/devices">
                        <Settings className="sidebar-icon" />
                        <span>Quản lý thiết bị</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/dashboard/logs">
                    <FileText className="sidebar-icon" />
                    <span>Nhật ký hoạt động</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {user.role === 'admin' && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/dashboard/users">
                      <Users className="sidebar-icon" />
                      <span>Quản lý người dùng</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${dbStatus ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-sidebar-foreground">
              {dbStatus ? 'Kết nối cơ sở dữ liệu: Hoạt động' : 'Kết nối cơ sở dữ liệu: Lỗi'}
            </span>
          </div>
          <Button variant="outline" className="w-full" onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Đăng xuất
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardLayout;
