require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// 导入安全中间件
const { securityHeaders } = require('./middleware/securityHeaders');
const { rateLimiters } = require('./middleware/rateLimit');

// 导入中间件
const { errorHandler } = require('./middleware/error');
const { auditMiddleware } = require('./middleware/audit');

// 导入路由
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const leaveRoutes = require('./routes/leaves');
const paystubRoutes = require('./routes/paystubs');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');
const reportRoutes = require('./routes/reports');
const teamsRoutes = require('./routes/teams');
const orgRoutes = require('./routes/org');

const app = express();
const PORT = process.env.PORT || 3000;

// 安全头中间件 (Helmet.js)
app.use(securityHeaders);

// 速率限制
app.use('/api', rateLimiters.api.middleware());
app.use('/api/auth/login', rateLimiters.login.middleware());

// 中间件
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 审计日志中间件 (排除健康检查等请求)
app.use(auditMiddleware);

// 健康检查端点
app.get('/health', (req, res) => {
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
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: '路由不存在',
    code: 'ROUTE_NOT_FOUND',
    path: req.path,
  });
});

// 错误处理中间件 - 必须在 404 之后
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`HR System API server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
