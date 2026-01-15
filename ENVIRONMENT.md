# 环境配置说明

本文档描述 HR 系统的所有环境变量配置。

## 后端环境变量

### 必需配置

| 变量名 | 描述 | 默认值 | 示例 |
|--------|------|--------|------|
| `DB_HOST` | PostgreSQL 数据库主机 | `localhost` | `db.example.com` |
| `DB_PORT` | PostgreSQL 数据库端口 | `5432` | `5432` |
| `DB_NAME` | 数据库名称 | `hr_system` | `hr_production` |
| `DB_USER` | 数据库用户名 | `postgres` | `hr_admin` |
| `DB_PASSWORD` | 数据库密码 | - | `secure_password` |

### 可选配置

| 变量名 | 描述 | 默认值 | 示例 |
|--------|------|--------|------|
| `JWT_SECRET` | JWT 签名密钥 | - | `your-256-bit-secret` |
| `JWT_EXPIRES_IN` | Token 过期时间 | `7d` | `24h`, `7d`, `30d` |
| `PORT` | 服务器端口 | `3000` | `8080` |
| `NODE_ENV` | 运行环境 | `development` | `production` |
| `CORS_ORIGIN` | CORS 允许的来源 | `http://localhost:5173` | `https://hr.company.com` |

## 前端环境变量

| 变量名 | 描述 | 默认值 | 示例 |
|--------|------|--------|------|
| `VITE_API_URL` | 后端 API 地址 | `http://localhost:3000/api` | `https://api.hr.company.com` |

## 环境配置文件示例

### 开发环境 (.env.development)

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hr_system
DB_USER=postgres
DB_PASSWORD=postgres

# JWT
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### 生产环境 (.env.production)

```env
# Database
DB_HOST=db.example.com
DB_PORT=5432
DB_NAME=hr_production
DB_USER=hr_admin
DB_PASSWORD=<strong-password>

# JWT - 使用复杂的随机字符串
JWT_SECRET=<very-long-random-string-at-least-32-chars>
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://hr.company.com
```

### 前端生产环境 (.env.production)

```env
VITE_API_URL=https://api.hr.company.com
```

## Docker 环境变量

当使用 Docker Compose 部署时，环境变量在 `docker-compose.yml` 中配置：

```yaml
services:
  backend:
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=hr_system
      - DB_USER=postgres
      - DB_PASSWORD=postgres
      - JWT_SECRET=${JWT_SECRET}
      - PORT=3000
      - CORS_ORIGIN=http://localhost
```

**注意**: 生产环境中 `JWT_SECRET` 应通过 `.env` 文件或环境变量注入，不要直接写入 `docker-compose.yml`。

## 安全建议

1. **不要提交 .env 文件**: 确保 `.env` 文件在 `.gitignore` 中
2. **使用强密码**: 数据库密码和 JWT Secret 应使用随机生成的强密码
3. **生产环境分离**: 开发环境和生产环境使用不同的配置
4. **密钥轮换**: 定期更换 JWT Secret