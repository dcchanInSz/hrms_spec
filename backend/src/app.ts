import 'dotenv/config';
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';

// 导入安全中间件
import { securityHeaders } from './middleware/securityHeaders';
import { rateLimiters } from './middleware/rateLimit';

// 导入中间件
import { errorHandler } from './middleware/error';
import { auditMiddleware } from './middleware/audit';

// 导入路由
import authRoutes from './routes/auth';
import employeeRoutes from './routes/employees';
import leaveRoutes from './routes/leaves';
import paystubRoutes from './routes/paystubs';
import notificationRoutes from './routes/notifications';
import adminRoutes from './routes/admin';
import reportRoutes from './routes/reports';
import teamsRoutes from './routes/teams';
import orgRoutes from './routes/org';

const app: Application = express();
const PORT: number = parseInt((process.env as any).PORT || '3000', 10);

// 安全头中间件 (Helmet.js)
app.use(securityHeaders);

// CORS - 必须在速率限制之前，避免预检请求被拦截
app.use(cors({
  origin: (process.env as any).CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

// 速率限制
app.use('/api', rateLimiters.api.middleware);
app.use('/api/auth/login', rateLimiters.login.middleware);

// 其他中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 审计日志中间件 (排除健康检查等请求)
app.use(auditMiddleware);

// 健康检查端点
app.get('/health', (req: Request, res: Response): void => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/paystubs', paystubRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/org', orgRoutes);

// 404 处理 - 必须在所有路由之后
app.use((req: Request, res: Response): void => {
  res.status(404).json({
    error: 'Not Found',
    message: '路由不存在',
    code: 'ROUTE_NOT_FOUND',
    path: req.path,
  });
});

// 错误处理中间件 - 必须在 404 之后
app.use(errorHandler);

app.listen(PORT, (): void => {
  console.log(`HR System API server running on port ${PORT}`);
  console.log(`Environment: ${(process.env as any).NODE_ENV || 'development'}`);
});

export default app;
