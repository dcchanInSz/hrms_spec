import { Pool, PoolClient, QueryResult } from 'pg';

// 数据库连接池
const pool: Pool = new Pool({
  host: (process.env as any).DB_HOST || 'localhost',
  port: parseInt((process.env as any).DB_PORT || '5432', 10),
  database: (process.env as any).DB_NAME || 'hr_system',
  user: (process.env as any).DB_USER || 'postgres',
  password: (process.env as any).DB_PASSWORD || '',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// 连接池错误处理
pool.on('error', (err: Error): void => {
  console.error('Unexpected error on idle client', err);
});

// 查询函数 - 返回 Promise
async function query<T = any>(text: string, params?: any[]): Promise<QueryResult<any>> {
  const start: number = Date.now();
  const result: QueryResult<any> = await pool.query<any>(text, params);
  const duration: number = Date.now() - start;
  console.log('Executed query', { text: text.substring(0, 50), duration, rows: result.rowCount });
  return result;
}

// 事务支持
async function transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client: PoolClient = await pool.connect();
  try {
    await client.query('BEGIN');
    const result: T = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

// 获取连接（用于需要客户端特定操作）
async function getClient(): Promise<PoolClient> {
  return await pool.connect();
}

export {
  query,
  transaction,
  getClient,
  pool,
};

export default pool;
