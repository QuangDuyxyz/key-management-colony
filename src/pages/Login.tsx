
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { loginUser } from '@/lib/auth';
import { toast } from "sonner";
import { Key } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await loginUser(username, password);
      if (user) {
        login(user);
        toast.success("Đăng nhập thành công!");
        navigate('/dashboard');
      } else {
        setError('Tên đăng nhập hoặc mật khẩu không chính xác');
      }
    } catch (error) {
      console.error('Login failed', error);
      setError('Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex justify-center mb-8">
          <div className="bg-primary p-3 rounded-full">
            <Key className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Đăng Nhập</CardTitle>
            <CardDescription className="text-center">
              Nhập thông tin đăng nhập để tiếp tục
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Tên đăng nhập</Label>
                  <Input 
                    id="username" 
                    placeholder="Nhập tên đăng nhập..." 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Nhập mật khẩu..." 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Hệ thống quản lý key bản quyền phần mềm
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
