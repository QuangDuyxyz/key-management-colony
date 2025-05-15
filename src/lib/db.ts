
import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
  host: '127.0.0.1',
  port: 3308,
  user: 'KingAutoColony',
  password: 'StrongPass123',
  database: 'license_system',
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Test the connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection established successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('Failed to connect to database:', error);
    return false;
  }
}

// Execute a query with parameters
async function query<T>(sql: string, params?: any[]): Promise<T> {
  try {
    const [results] = await pool.execute(sql, params || []);
    return results as T;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export { testConnection, query, pool };
