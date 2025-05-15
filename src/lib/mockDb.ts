
// This file provides a mock database implementation for browser environments
import { User } from './auth';

// Mock users data
const users = [
  {
    id: 1,
    username: 'admin',
    role: 'admin',
    created_at: '2023-01-01T00:00:00Z'
  },
  {
    id: 2,
    username: 'user',
    role: 'user',
    created_at: '2023-02-01T00:00:00Z'
  }
];

// Mock devices data
const devices = [
  {
    id: 1,
    mac: '00:1A:2B:3C:4D:5E',
    hostname: 'DESKTOP-ABC123',
    key_code: 'KEY-123456-ABCDEF',
    active: 1,
    activated_at: '2023-03-15T10:30:45Z',
    expires_at: '2024-03-15T10:30:45Z',
    added_by: 'admin',
    created_at: '2023-03-15T10:30:00Z'
  },
  {
    id: 2,
    mac: '00:1A:2B:3C:4D:5F',
    hostname: 'LAPTOP-XYZ456',
    key_code: 'KEY-789012-GHIJKL',
    active: 1,
    activated_at: '2023-04-20T14:22:30Z',
    expires_at: '2024-04-20T14:22:30Z',
    added_by: 'admin',
    created_at: '2023-04-20T14:20:00Z'
  },
  {
    id: 3,
    mac: '00:1A:2B:3C:4D:60',
    hostname: 'WORKSTATION-789',
    key_code: 'KEY-345678-MNOPQR',
    active: 0,
    activated_at: null,
    expires_at: null,
    added_by: 'user',
    created_at: '2023-05-10T09:45:00Z'
  }
];

// Mock logs data
const logs = [
  {
    id: 1,
    mac: '00:1A:2B:3C:4D:5E',
    hostname: 'DESKTOP-ABC123',
    action: 'Kích hoạt key',
    performed_by: 'admin',
    timestamp: '2023-03-15T10:30:45Z'
  },
  {
    id: 2,
    mac: '00:1A:2B:3C:4D:5F',
    hostname: 'LAPTOP-XYZ456',
    action: 'Kích hoạt key',
    performed_by: 'admin',
    timestamp: '2023-04-20T14:22:30Z'
  },
  {
    id: 3,
    mac: '00:1A:2B:3C:4D:60',
    hostname: 'WORKSTATION-789',
    action: 'Thêm thiết bị mới',
    performed_by: 'user',
    timestamp: '2023-05-10T09:45:00Z'
  },
  {
    id: 4,
    mac: '00:1A:2B:3C:4D:5E',
    hostname: 'DESKTOP-ABC123',
    action: 'Kiểm tra trạng thái',
    performed_by: 'admin',
    timestamp: '2023-06-15T08:12:30Z'
  },
  {
    id: 5,
    mac: '00:1A:2B:3C:4D:5F',
    hostname: 'LAPTOP-XYZ456',
    action: 'Kiểm tra trạng thái',
    performed_by: 'user',
    timestamp: '2023-07-01T16:40:20Z'
  }
];

// Mock database connection test
async function testConnection(): Promise<boolean> {
  console.log('Mock database connection test - success');
  return true;
}

// Generic mock query function
async function query<T>(sql: string, params?: any[]): Promise<T> {
  console.log('Mock SQL query:', sql);
  console.log('Parameters:', params || []);

  // Simple mock implementation based on the query
  if (sql.includes('SELECT * FROM users')) {
    return users as unknown as T;
  } else if (sql.includes('SELECT id, username, role, created_at FROM users')) {
    return users as unknown as T;
  } else if (sql.includes('SELECT COUNT(*) as count FROM users')) {
    return [{ count: users.length }] as unknown as T;
  } else if (sql.includes('SELECT * FROM devices')) {
    return devices as unknown as T;
  } else if (sql.includes('SELECT COUNT(*) as count FROM devices')) {
    return [{ count: devices.length }] as unknown as T;
  } else if (sql.includes('SELECT COUNT(*) as count FROM devices WHERE active = 1')) {
    return [{ count: devices.filter(d => d.active === 1).length }] as unknown as T;
  } else if (sql.includes('SELECT * FROM logs')) {
    return logs as unknown as T;
  } else if (sql.includes('username = ?') && params && params[0]) {
    // Mock user login
    const hashedPassword = params && params.length > 1 ? params[1] : '';
    const foundUser = users.find(u => u.username === params[0]);
    
    // For demo purposes, any password works
    if (foundUser) {
      return [foundUser] as unknown as T;
    } else {
      return [] as unknown as T;
    }
  }

  // Default empty response
  return [] as unknown as T;
}

// Mock database pool
const pool = {
  query,
  execute: query,
  getConnection: async () => ({
    query,
    execute: query,
    release: () => {}
  })
};

export { testConnection, query, pool };
