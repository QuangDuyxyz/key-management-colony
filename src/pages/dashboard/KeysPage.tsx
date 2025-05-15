
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
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

const KeysPage = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openNewKeyDialog, setOpenNewKeyDialog] = useState(false);
  const [newKeyFormData, setNewKeyFormData] = useState({
    mac: '',
    hostname: '',
    key_code: '',
    expires_at: ''
  });
  
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
      toast.error('Không thể tải danh sách key');
    } finally {
      setLoading(false);
    }
  };

  const generateKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 24; i++) {
      if (i > 0 && i % 4 === 0) result += '-';
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewKeyFormData({...newKeyFormData, key_code: result});
  };

  const createNewKey = async () => {
    try {
      // Validate form
      if (!newKeyFormData.mac || !newKeyFormData.hostname || !newKeyFormData.key_code) {
        toast.error('Vui lòng điền đầy đủ thông tin');
        return;
      }
      
      // Check if MAC already exists
      const existingDevices = await query<any[]>(
        'SELECT * FROM devices WHERE mac = ?',
        [newKeyFormData.mac]
      );
      
      if (existingDevices.length > 0) {
        toast.error('MAC đã tồn tại trong hệ thống');
        return;
      }
      
      // Format expires_at date
      const expiresAt = newKeyFormData.expires_at 
        ? new Date(newKeyFormData.expires_at).toISOString().slice(0, 19).replace('T', ' ')
        : null;
      
      // Insert new device
      await query(
        'INSERT INTO devices (mac, hostname, key_code, active, added_by, created_at, expires_at) VALUES (?, ?, ?, 0, ?, NOW(), ?)',
        [
          newKeyFormData.mac,
          newKeyFormData.hostname,
          newKeyFormData.key_code,
          user?.username,
          expiresAt
        ]
      );
      
      // Log the action
      await query(
        'INSERT INTO logs (mac, hostname, action, performed_by, timestamp) VALUES (?, ?, ?, ?, NOW())',
        [
          newKeyFormData.mac,
          newKeyFormData.hostname,
          'Tạo key mới',
          user?.username
        ]
      );
      
      toast.success('Tạo key mới thành công');
      setOpenNewKeyDialog(false);
      
      // Reset form
      setNewKeyFormData({
        mac: '',
        hostname: '',
        key_code: '',
        expires_at: ''
      });
      
      // Refresh the devices list
      fetchDevices();
      
    } catch (error) {
      console.error('Error creating new key:', error);
      toast.error('Không thể tạo key mới');
    }
  };

  const filteredDevices = devices.filter(device => 
    device.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.mac.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.key_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Không giới hạn';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý key</h1>
          <p className="text-muted-foreground">Quản lý key bản quyền phần mềm trong hệ thống.</p>
        </div>
        <Dialog open={openNewKeyDialog} onOpenChange={setOpenNewKeyDialog}>
          <DialogTrigger asChild>
            <Button>Tạo key mới</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo key mới</DialogTitle>
              <DialogDescription>
                Tạo key mới cho thiết bị. Key sẽ được tạo với trạng thái chưa kích hoạt.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="mac">Địa chỉ MAC</Label>
                <Input
                  id="mac"
                  placeholder="Nhập địa chỉ MAC của thiết bị"
                  value={newKeyFormData.mac}
                  onChange={(e) => setNewKeyFormData({...newKeyFormData, mac: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hostname">Tên máy</Label>
                <Input
                  id="hostname"
                  placeholder="Nhập tên máy"
                  value={newKeyFormData.hostname}
                  onChange={(e) => setNewKeyFormData({...newKeyFormData, hostname: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="key">Key</Label>
                <div className="flex space-x-2">
                  <Input
                    id="key"
                    placeholder="Key bản quyền"
                    value={newKeyFormData.key_code}
                    onChange={(e) => setNewKeyFormData({...newKeyFormData, key_code: e.target.value})}
                    className="flex-grow"
                  />
                  <Button variant="outline" onClick={generateKey} type="button">
                    Tạo key
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expires">Ngày hết hạn (tùy chọn)</Label>
                <Input
                  id="expires"
                  type="date"
                  value={newKeyFormData.expires_at}
                  onChange={(e) => setNewKeyFormData({...newKeyFormData, expires_at: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenNewKeyDialog(false)}>
                Hủy
              </Button>
              <Button onClick={createNewKey}>
                Tạo key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
        <Button variant="outline" onClick={() => fetchDevices()}>
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
                <TableHead>Key</TableHead>
                <TableHead>MAC</TableHead>
                <TableHead>Tên máy</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Hạn sử dụng</TableHead>
                <TableHead>Người tạo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDevices.length > 0 ? (
                filteredDevices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell className="font-mono">{device.key_code}</TableCell>
                    <TableCell className="font-mono">{device.mac}</TableCell>
                    <TableCell>{device.hostname}</TableCell>
                    <TableCell>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${device.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {device.active ? 'Đã kích hoạt' : 'Chưa kích hoạt'}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(device.expires_at)}</TableCell>
                    <TableCell>{device.added_by}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    Không tìm thấy key nào
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

export default KeysPage;
