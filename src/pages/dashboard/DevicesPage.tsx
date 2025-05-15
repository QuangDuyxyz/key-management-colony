
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
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from "sonner";
import { query } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import { Check, Plus, RotateCcw, Search, Trash2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
  const [addKeyDialog, setAddKeyDialog] = useState(false);
  const [newKeyDuration, setNewKeyDuration] = useState('30'); // default 30 days
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

  const handleDeleteDevice = async (device: Device) => {
    try {
      await query('DELETE FROM devices WHERE id = ?', [device.id]);
      
      // Log the action
      await query(
        'INSERT INTO logs (mac, hostname, action, performed_by, timestamp) VALUES (?, ?, ?, ?, NOW())',
        [
          device.mac,
          device.hostname,
          'Xóa thiết bị',
          user?.username || 'unknown'
        ]
      );
      
      // Update local state
      setDevices(devices.filter(d => d.id !== device.id));
      
      toast.success('Đã xóa thiết bị thành công');
      setOpenDialog(false);
    } catch (error) {
      console.error('Error deleting device:', error);
      toast.error('Không thể xóa thiết bị');
    }
  };

  const handleViewDetails = (device: Device) => {
    setSelectedDevice(device);
    setOpenDialog(true);
  };

  const handleAddKey = async (device: Device) => {
    try {
      // Calculate expiration date based on selected duration
      let expiresAt = null;
      
      if (newKeyDuration !== 'forever') {
        const days = parseInt(newKeyDuration);
        const date = new Date();
        date.setDate(date.getDate() + days);
        expiresAt = date.toISOString().split('T')[0];
      }
      
      // Update device with new key
      await query(
        'UPDATE devices SET active = 1, activated_at = NOW(), expires_at = ? WHERE id = ?',
        [expiresAt, device.id]
      );
      
      // Log the action
      await query(
        'INSERT INTO logs (mac, hostname, action, performed_by, timestamp) VALUES (?, ?, ?, ?, NOW())',
        [
          device.mac,
          device.hostname,
          `Cấp key ${expiresAt ? 'hết hạn ' + expiresAt : 'vĩnh viễn'}`,
          user?.username || 'unknown'
        ]
      );
      
      // Update local state
      setDevices(devices.map(d => 
        d.id === device.id 
          ? { 
              ...d, 
              active: 1, 
              activated_at: new Date().toISOString(), 
              expires_at: expiresAt 
            } 
          : d
      ));
      
      toast.success('Đã cấp key thành công');
      setAddKeyDialog(false);
    } catch (error) {
      console.error('Error adding key:', error);
      toast.error('Không thể cấp key');
    }
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
        <div className="flex gap-2 items-center">
          <Search className="text-muted-foreground h-5 w-5" />
          <Input
            placeholder="Tìm kiếm theo tên máy, MAC, key..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Button onClick={() => fetchDevices()}>
          <RotateCcw className="mr-1 h-4 w-4" />
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
                <TableHead>Hết hạn</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDevices.length > 0 ? (
                filteredDevices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell className="font-mono">{device.mac}</TableCell>
                    <TableCell>{device.hostname}</TableCell>
                    <TableCell className="font-mono">{device.key_code.substring(0, 10)}...</TableCell>
                    <TableCell>
                      <Badge variant={device.active ? "success" : "destructive"} className="flex items-center w-fit gap-1">
                        {device.active ? (
                          <>
                            <Check className="h-3 w-3" /> Đã kích hoạt
                          </>
                        ) : (
                          <>
                            <X className="h-3 w-3" /> Chưa kích hoạt
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {device.expires_at ? formatDate(device.expires_at) : 'Vĩnh viễn'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedDevice(device);
                            setAddKeyDialog(true);
                          }}
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          Cấp key
                        </Button>
                        <Button
                          variant={device.active ? "destructive" : "default"}
                          size="sm"
                          onClick={() => toggleDeviceStatus(device)}
                        >
                          <RotateCcw className="h-3.5 w-3.5 mr-1" />
                          Reset
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleViewDetails(device)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    Không tìm thấy thiết bị nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Device Delete Confirmation Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xóa thiết bị</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa thiết bị này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          
          {selectedDevice && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-sm font-medium">MAC:</div>
                <div className="col-span-2 font-mono">{selectedDevice.mac}</div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-sm font-medium">Tên máy:</div>
                <div className="col-span-2">{selectedDevice.hostname}</div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Hủy
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedDevice && handleDeleteDevice(selectedDevice)}
            >
              Xác nhận xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Key Dialog */}
      <Dialog open={addKeyDialog} onOpenChange={setAddKeyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cấp key cho thiết bị</DialogTitle>
            <DialogDescription>
              Chọn thời hạn key bản quyền cho thiết bị
            </DialogDescription>
          </DialogHeader>
          
          {selectedDevice && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-sm font-medium">MAC:</div>
                <div className="col-span-2 font-mono">{selectedDevice.mac}</div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-sm font-medium">Tên máy:</div>
                <div className="col-span-2">{selectedDevice.hostname}</div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="duration" className="text-sm font-medium">
                  Thời hạn:
                </label>
                <Select
                  value={newKeyDuration}
                  onValueChange={setNewKeyDuration}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn thời hạn" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 ngày</SelectItem>
                    <SelectItem value="3">3 ngày</SelectItem>
                    <SelectItem value="30">1 tháng</SelectItem>
                    <SelectItem value="180">6 tháng</SelectItem>
                    <SelectItem value="730">2 năm</SelectItem>
                    <SelectItem value="forever">Vĩnh viễn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddKeyDialog(false)}>
              Hủy
            </Button>
            <Button 
              variant="default" 
              onClick={() => selectedDevice && handleAddKey(selectedDevice)}
            >
              Cấp key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DevicesPage;
