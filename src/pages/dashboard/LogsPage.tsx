
import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { query } from '@/lib/db';
import { toast } from 'sonner';

interface Log {
  id: number;
  mac: string;
  hostname: string;
  action: string;
  performed_by: string;
  timestamp: string;
}

const LogsPage = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const result = await query<Log[]>('SELECT * FROM logs ORDER BY timestamp DESC LIMIT 100');
      setLogs(result);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Không thể tải nhật ký hoạt động');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.mac.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.performed_by.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString('vi-VN');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nhật ký hoạt động</h1>
        <p className="text-muted-foreground">Danh sách các hoạt động gần đây trong hệ thống.</p>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="max-w-sm">
          <Input
            placeholder="Tìm kiếm theo tên máy, MAC, hành động..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Button onClick={() => fetchLogs()}>
          Làm mới
        </Button>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="text-lg font-medium text-gray-500">Đang tải dữ liệu...</div>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thời gian</TableHead>
                <TableHead>MAC</TableHead>
                <TableHead>Tên máy</TableHead>
                <TableHead>Hành động</TableHead>
                <TableHead>Người thực hiện</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">{formatDateTime(log.timestamp)}</TableCell>
                    <TableCell className="font-mono">{log.mac}</TableCell>
                    <TableCell>{log.hostname}</TableCell>
                    <TableCell>
                      <span className={`inline-block px-2 py-1 rounded text-xs ${
                        log.action.includes('kích hoạt') 
                          ? 'bg-blue-100 text-blue-800' 
                          : log.action.includes('Hủy') 
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell>{log.performed_by}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    Không tìm thấy nhật ký nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default LogsPage;
