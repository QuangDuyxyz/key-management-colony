
import { query } from './db';
import crypto from 'crypto';

export interface User {
  id: number;
  username: string;
  role: string;
  created_at: string;
}

// Giả lập hàm hash bcrypt
function hashPassword(password: string): string {
  // Trong môi trường thực tế, sử dụng bcrypt.hashSync(password, 10)
  // Ở đây chúng ta sử dụng SHA-256 để giả lập
  return crypto
    .createHash('sha256')
    .update(password)
    .digest('hex');
}

// So sánh mật khẩu
function comparePassword(password: string, hashedPassword: string): boolean {
  // Trong môi trường thực tế, sử dụng bcrypt.compareSync(password, hashedPassword)
  const hash = hashPassword(password);
  return hash === hashedPassword;
}

// Đăng nhập người dùng
async function loginUser(username: string, password: string): Promise<User | null> {
  try {
    // Lấy thông tin người dùng từ database
    const users = await query<any[]>(
      'SELECT id, username, password_hash, role, created_at FROM users WHERE username = ?',
      [username]
    );

    if (users && users.length > 0) {
      const user = users[0];
      // So sánh mật khẩu
      if (comparePassword(password, user.password_hash)) {
        // Trả về thông tin người dùng không bao gồm password_hash
        const { password_hash, ...userWithoutPassword } = user;
        return userWithoutPassword as User;
      }
    }
    return null;
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    return null;
  }
}

// Kiểm tra quyền người dùng
function checkPermission(user: User | null, requiredRole: string[]): boolean {
  if (!user) return false;
  return requiredRole.includes(user.role);
}

export { loginUser, checkPermission };
