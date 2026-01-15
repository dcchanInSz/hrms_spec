# 小企业人力资源管理系统

面向 10-50 人小型企业的人力资源管理系统，支持员工自助服务、经理团队管理和 HR 行政管理。

## 功能特性

### 员工功能
- 登录认证与个人信息管理
- 请假申请与查看
- 工资单查询
- 通知中心

### 经理功能
- 团队仪表盘
- 请假审批
- 团队成员管理
- 团队日历

### HR 功能
- 员工管理 (CRUD)
- 部门管理
- 组织架构图
- 审计日志
- 报表分析

## 技术栈

### 后端
- Node.js 18+
- Express 4.x
- PostgreSQL 14+
- JWT 认证
- bcrypt 密码加密

### 前端
- React 18
- Vite 5
- TailwindCSS 3
- React Router 6
- Axios

## 快速开始

### 环境要求
- Node.js 18+
- PostgreSQL 14+

### 后端设置

```bash
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置数据库连接信息

# 运行数据库迁移
npm run migrate

# 初始化种子数据
npm run seed

# 启动开发服务器
npm run dev
```

### 前端设置

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 默认账号

迁移脚本会自动创建以下测试账号：

| 角色 | 邮箱 | 密码 |
|------|------|------|
| HR 管理员 | hr@company.com | hr123456 |
| 经理 | manager@company.com | mgr123456 |
| 员工 | employee@company.com | emp123456 |

## 项目结构

```
hr-system/
├── backend/
│   ├── src/
│   │   ├── controllers/    # HTTP 请求处理
│   │   ├── middleware/     # 中间件
│   │   ├── models/         # 数据模型
│   │   ├── routes/         # 路由定义
│   │   ├── services/       # 业务逻辑
│   │   └── utils/          # 工具函数
│   ├── scripts/            # 迁移和种子脚本
│   ├── tests/              # 测试文件
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # 通用组件
│   │   ├── contexts/       # React Context
│   │   ├── hooks/          # 自定义 Hooks
│   │   ├── pages/          # 页面组件
│   │   ├── services/       # API 服务
│   │   └── styles/         # 全局样式
│   └── package.json
│
└── README.md
```

## 环境变量

### 后端 (.env)

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hr_system
DB_USER=postgres
DB_PASSWORD=your_password

# JWT 配置
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d

# 服务器配置
PORT=3000
NODE_ENV=development

# CORS 配置
CORS_ORIGIN=http://localhost:5173
```

### 前端 (.env)

```env
VITE_API_URL=http://localhost:3000/api
```

## API 文档

### 认证
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 退出登录
- `GET /api/auth/profile` - 获取当前用户信息

### 员工
- `GET /api/employees/me` - 获取个人资料
- `PUT /api/employees/me` - 更新个人资料
- `GET /api/employees/balance` - 获取请假余额

### 请假
- `GET /api/leaves` - 获取我的请假列表
- `POST /api/leaves` - 创建请假申请
- `PUT /api/leaves/:id/approve` - 审批通过
- `PUT /api/leaves/:id/reject` - 审批拒绝

### 经理
- `GET /api/teams/dashboard` - 团队仪表盘
- `GET /api/teams/members` - 团队成员列表
- `GET /api/teams/calendar` - 团队日历

### HR
- `GET /api/admin/employees` - 员工列表
- `POST /api/admin/employees` - 创建员工
- `GET /api/admin/departments` - 部门列表
- `GET /api/admin/audit-logs` - 审计日志

## 测试

```bash
# 后端测试
cd backend
npm test

# 前端测试
cd frontend
npm test
```

## 部署

### Docker 部署

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d
```

### 手动部署

1. 构建前端：`cd frontend && npm run build`
2. 配置生产环境变量
3. 使用 PM2 或类似工具启动后端
4. 配置 Nginx 反向代理

## 安全考虑

- JWT Token 认证
- 密码 bcrypt 加密
- RBAC 角色权限控制
- API 速率限制
- SQL 注入防护
- 安全响应头 (Helmet.js)
- CORS 配置

## 许可证

MIT