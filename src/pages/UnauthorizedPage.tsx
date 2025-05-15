
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Lock } from "lucide-react";

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto bg-red-500/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Không có quyền truy cập</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4 text-muted-foreground">
            {user ? (
              <>
                Tài khoản <span className="font-medium">{user.username}</span> với vai trò <span className="font-medium">{user.role}</span> không có quyền truy cập nội dung này.
              </>
            ) : (
              <>
                Bạn không có quyền truy cập vào trang này. Vui lòng đăng nhập với tài khoản có quyền phù hợp.
              </>
            )}
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button 
            className="w-full" 
            onClick={() => navigate('/dashboard')}
          >
            Quay lại trang chủ
          </Button>
          {!user && (
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate('/login')}
            >
              Đăng nhập
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default UnauthorizedPage;
