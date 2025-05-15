
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { query } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import crypto from 'crypto';

interface User {
  id: number;
  username: string;
  role: string;
  created_at: string;
}

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openNewUserDialog, setOpenNewUserDialog] = useState(false);
  const [newUserFormData, setNewUserFormData] = useState({
    username: '',
    password: '',
    role: 'user'
  });
  
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role !== 'admin') {
      toast.error('Bạn không có quyền truy cập trang này');
      return;
    }
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const result = await query<User[]>('SELECT id, username, role, created_at FROM users');
      setUsers(result);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const createNewUser = async () => {
    try {
      // Validate form
      if (!newUserFormData.username || !newUserFormData.password) {
        toast.error('Vui lòng điền đầy đủ thông tin');
        return;
      }
      
      // Check if username already exists
      const existingUsers = await query<any[]>(
        'SELECT * FROM users WHERE username = ?',
        [newUserFormData.username]
      );
      
      if (existingUsers.length > 0) {
        toast.error('Tên đăng nhập đã tồn tại');
        return;
      }
      
      // Hash password
      const hashedPassword = crypto
        .createHash('sha256')
        .update(newUserFormData.password)
        .digest('hex');
      
      // Insert new user
      await query(
        'INSERT INTO users (username, password_hash, role, created_at) VALUES (?, ?, ?, NOW())',
        [
          newUserFormData.username,
          hashedPassword,
          newUserFormData.role
        ]
      );
      
      toast.success('Tạo người dùng mới thành công');
      setOpenNewUserDialog(false);
      
      // Reset form
      setNewUserFormData({
        username: '',
        password: '',
        role: 'user'
      });
      
      // Refresh the users list
      fetchUsers();
      
    } catch (error) {
      console.error('Error creating new user:', error);
      toast.error('Không thể tạo người dùng mới');
    }
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="text-lg font-medium text-destructive">Bạn không có quyền truy cập trang này</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h1>
          <p className="text-muted-foreground">Quản lý người dùng trong hệ thống.</p>
        </div>
        <Dialog open={openNewUserDialog} onOpenChange={setOpenNewUserDialog}>
          <DialogTrigger asChild>
            <Button>Thêm người dùng</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm người dùng mới</DialogTitle>
              <DialogDescription>
                Thêm người dùng mới vào hệ thống.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="username">Tên đăng nhập</Label>
                <Input
                  id="username"
                  placeholder="Tên đăng nhập"
                  value={newUserFormData.username}
                  onChange={(e) => setNewUserFormData({...newUserFormData, username: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mật khẩu"
                  value={newUserFormData.password}
                  onChange={(e) => setNewUserFormData({...newUserFormData, password: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Vai trò</Label>
                <Select 
                  value={newUserFormData.role}
                  onValueChange={(value) => setNewUserFormData({...newUserFormData, role: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Người dùng</SelectItem>
                    <SelectItem value="admin">Quản trị viên</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenNewUserDialog(false)}>
                Hủy
              </Button>
              <Button onClick={createNewUser}>
                Tạo người dùng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="max-w-sm">
          <Input
            placeholder="Tìm kiếm người dùng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Button variant="outline" onClick={() => fetchUsers()}>
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
                <TableHead>ID</TableHead>
                <TableHead>Tên đăng nhập</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Ngày tạo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                        {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                    Không tìm thấy người dùng nào
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

export default UsersPage;
