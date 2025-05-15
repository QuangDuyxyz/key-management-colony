
import { query } from './mockDb';
import crypto from 'crypto';

export interface User {
  id: number;
  username: string;
  role: string;
  created_at: string;
}

// Login user
async function loginUser(username: string, password: string): Promise<User | null> {
  try {
    // Hash the password the same way it's stored in the database
    const hashedPassword = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');
    
    const users = await query<any[]>(
      'SELECT id, username, role, created_at FROM users WHERE username = ? AND password_hash = ?',
      [username, hashedPassword]
    );

    if (users && users.length > 0) {
      return users[0] as User;
    }
    return null;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

export { loginUser };
