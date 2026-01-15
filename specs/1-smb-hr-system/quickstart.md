# Quickstart: 小企业人力资源管理系统

## 环境要求

- Node.js 18.0 或更高版本
- npm 9.0 或更高版本
- PostgreSQL 14.0 或更高版本
- 浏览器：Chrome、Firefox、Safari、Edge 最新版本

## 开发环境搭建

### 1. 克隆并安装依赖

```bash
# 克隆项目
git clone <repository-url>
cd <project-directory>

# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 2. 设置 PostgreSQL 数据库

```bash
# 创建数据库
psql -U postgres -c "CREATE DATABASE hr_system;"

# 运行迁移脚本创建表结构
cd backend
npm run migrate

# 填充初始数据（admin 用户、部门、职位、请假政策）
npm run seed
```

### 3. 配置环境变量

创建 `backend/.env` 文件：

```env
# 服务器配置
PORT=3000
NODE_ENV=development

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# PostgreSQL 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hr_system
DB_USER=postgres
DB_PASSWORD=your-password

# 前端 API 地址（用于 CORS）
FRONTEND_URL=http://localhost:5173
```

创建 `frontend/.env` 文件：

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 4. 启动开发服务器

**终端 1 - 后端：**

```bash
cd backend
npm run dev
```

后端将在 `http://localhost:3000` 启动

**终端 2 - 前端：**

```bash
cd frontend
npm run dev
```

前端将在 `http://localhost:5173` 启动

### 5. 验证安装

1. 打开浏览器访问 `http://localhost:5173`
2. 使用初始管理员账户登录：
   - 邮箱：`admin@company.com`
   - 密码：`admin123`
3. 验证各项功能是否正常

## 默认数据

### 初始管理员账户

| 邮箱 | 密码 | 角色 |
|------|------|------|
| admin@company.com | admin123 | HR 管理员 |

### 初始部门

- 技术部
- 市场部
- 人事部
- 财务部

### 初始请假政策

| 类型 | 默认天数 | 结转上限 | 需要审批 |
|------|----------|----------|----------|
| 年假 | 10 天 | 5 天 | 是 |
| 病假 | 10 天 | 0 | 是 |
| 事假 | 5 天 | 0 | 是 |

## 可用脚本

### 后端

```bash
cd backend

npm run dev        # 启动开发服务器（自动重启）
npm run start      # 启动生产服务器
npm run migrate    # 运行数据库迁移
npm run seed       # 填充测试数据
npm test           # 运行测试
npm run lint       # 代码检查
```

### 前端

```bash
cd frontend

npm run dev        # 启动开发服务器
npm run build      # 构建生产版本
npm run preview    # 预览生产构建
npm test           # 运行测试
npm run lint       # 代码检查
```

## 项目结构

```
hr-system/
├── backend/
│   ├── src/
│   │   ├── controllers/    # 控制器
│   │   ├── services/       # 业务逻辑
│   │   ├── models/         # 数据模型
│   │   ├── routes/         # 路由
│   │   ├── middleware/     # 中间件
│   │   └── utils/          # 工具函数
│   ├── migrations/         # 数据库迁移文件
│   ├── tests/              # 测试文件
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # 通用组件
│   │   ├── pages/          # 页面
│   │   ├── hooks/          # 自定义 hooks
│   │   ├── services/       # API 服务
│   │   └── styles/         # 样式
│   ├── tests/              # 测试文件
│   └── package.json
└── README.md
```

## 常见问题

### Q: PostgreSQL 连接失败？
A: 检查 .env 文件中的数据库配置是否正确，确保 PostgreSQL 服务正在运行

### Q: 如何重置数据库？
A: 删除所有表后运行 `npm run migrate && npm run seed`

### Q: CORS 错误？
A: 确保 `backend/.env` 中的 `FRONTEND_URL` 与前端地址一致

### Q: 忘记管理员密码？
A: 运行 `npm run seed` 重置数据库

## 下一步

1. 熟悉系统功能
2. 根据实际需求修改请假政策
3. 添加员工数据
4. 配置公司特定的部门结构
