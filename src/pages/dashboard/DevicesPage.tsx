
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
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle 
} from '@/components/ui/dialog';
import { toast } from "sonner";
import { query } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';

interface Device {
  id: number;
  mac: string;
  hostname: string;
  key_code: string;
  active: number;
  activated_at: string | null;
  expires_at: string | null;
  added_by: string;
  created_at: string;
}

const DevicesPage = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const result = await query<Device[]>('SELECT * FROM devices ORDER BY id DESC');
      setDevices(result);
    } catch (error) {
      console.error('Error fetching devices:', error);
      toast.error('Không thể tải danh sách thiết bị');
    } finally {
      setLoading(false);
    }
  };

  const filteredDevices = devices.filter(device => 
    device.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.mac.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.key_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleDeviceStatus = async (device: Device) => {
    try {
      const newStatus = device.active === 1 ? 0 : 1;
      await query(
        'UPDATE devices SET active = ? WHERE id = ?',
        [newStatus, device.id]
      );
      
      // Log the action
      await query(
        'INSERT INTO logs (mac, hostname, action, performed_by, timestamp) VALUES (?, ?, ?, ?, NOW())',
        [
          device.mac,
          device.hostname,
          newStatus === 1 ? 'Kích hoạt thiết bị' : 'Hủy kích hoạt thiết bị',
          user?.username || 'unknown'
        ]
      );

      // Update local state
      setDevices(devices.map(d => 
        d.id === device.id ? { ...d, active: newStatus } : d
      ));
      
      toast.success(`Đã ${newStatus === 1 ? 'kích hoạt' : 'hủy kích hoạt'} thiết bị thành công`);
    } catch (error) {
      console.error('Error toggling device status:', error);
      toast.error('Không thể thay đổi trạng thái thiết bị');
    }
  };

  const handleViewDetails = (device: Device) => {
    setSelectedDevice(device);
    setOpenDialog(true);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý thiết bị</h1>
          <p className="text-muted-foreground">Danh sách các thiết bị đã đăng ký trong hệ thống.</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="max-w-sm">
          <Input
            placeholder="Tìm kiếm theo tên máy, MAC, key..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Button onClick={() => fetchDevices()}>
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
                <TableHead>MAC</TableHead>
                <TableHead>Tên máy</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Người tạo</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDevices.length > 0 ? (
                filteredDevices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell className="font-mono">{device.mac}</TableCell>
                    <TableCell>{device.hostname}</TableCell>
                    <TableCell className="font-mono">{device.key_code.substring(0, 8)}...</TableCell>
                    <TableCell>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${device.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {device.active ? 'Đã kích hoạt' : 'Chưa kích hoạt'}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(device.created_at)}</TableCell>
                    <TableCell>{device.added_by}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(device)}
                        >
                          Chi tiết
                        </Button>
                        <Button 
                          variant={device.active ? "destructive" : "default"}
                          size="sm"
                          onClick={() => toggleDeviceStatus(device)}
                        >
                          {device.active ? 'Hủy kích hoạt' : 'Kích hoạt'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                    Không tìm thấy thiết bị nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        {selectedDevice && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Chi tiết thiết bị</DialogTitle>
              <DialogDescription>
                Thông tin chi tiết về thiết bị
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-sm font-medium">MAC:</div>
                <div className="col-span-2 font-mono">{selectedDevice.mac}</div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-sm font-medium">Tên máy:</div>
                <div className="col-span-2">{selectedDevice.hostname}</div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-sm font-medium">Key:</div>
                <div className="col-span-2 font-mono break-all">{selectedDevice.key_code}</div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-sm font-medium">Trạng thái:</div>
                <div className="col-span-2">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${selectedDevice.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {selectedDevice.active ? 'Đã kích hoạt' : 'Chưa kích hoạt'}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-sm font-medium">Ngày kích hoạt:</div>
                <div className="col-span-2">{formatDate(selectedDevice.activated_at)}</div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-sm font-medium">Hết hạn:</div>
                <div className="col-span-2">{formatDate(selectedDevice.expires_at)}</div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-sm font-medium">Người tạo:</div>
                <div className="col-span-2">{selectedDevice.added_by}</div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-sm font-medium">Ngày tạo:</div>
                <div className="col-span-2">{formatDate(selectedDevice.created_at)}</div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Đóng
              </Button>
              <Button 
                variant={selectedDevice.active ? "destructive" : "default"}
                onClick={() => {
                  toggleDeviceStatus(selectedDevice);
                  setOpenDialog(false);
                }}
              >
                {selectedDevice.active ? 'Hủy kích hoạt' : 'Kích hoạt'}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default DevicesPage;
