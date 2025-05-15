import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Key, Database, User, FileText } from 'lucide-react';
import { query } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  totalDevices: number;
  activeDevices: number;
  totalUsers: number;
  recentLogs: {
    id: number;
    mac: string;
    hostname: string;
    action: string;
    performed_by: string;
    timestamp: string;
  }[];
}

const DashboardHome = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const totalDevices = await query<any[]>('SELECT COUNT(*) as count FROM devices');
        const activeDevices = await query<any[]>('SELECT COUNT(*) as count FROM devices WHERE active = 1');
        const totalUsers = await query<any[]>('SELECT COUNT(*) as count FROM users');
        const recentLogs = await query<any[]>('SELECT * FROM logs ORDER BY timestamp DESC LIMIT 5');
        
        setStats({
          totalDevices: totalDevices[0].count,
          activeDevices: activeDevices[0].count,
          totalUsers: totalUsers[0].count,
          recentLogs
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <div className="text-lg font-medium text-gray-500">Đang tải dữ liệu...</div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bảng điều khiển</h1>
        <p className="text-muted-foreground">Tổng quan hệ thống quản lý key bản quyền phần mềm.</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="dashboard-stats-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tổng thiết bị</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalDevices || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="dashboard-stats-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Thiết bị kích hoạt</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.activeDevices || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="dashboard-stats-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Người dùng</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalUsers || 0}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-1">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Hoạt động gần đây</CardTitle>
              <p className="text-sm text-muted-foreground">5 hoạt động gần nhất trong hệ thống</p>
            </div>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats?.recentLogs && stats.recentLogs.length > 0 ? (
              <div className="space-y-2">
                {stats.recentLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{log.action}</p>
                      <p className="text-sm text-muted-foreground">
                        {log.mac} - {log.hostname}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString('vi-VN')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground py-4 text-center">Không có hoạt động nào gần đây</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;
