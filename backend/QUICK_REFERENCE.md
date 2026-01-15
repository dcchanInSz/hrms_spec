# TypeScript 工作流快速参考

## 🚀 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 启动开发模式
npm run dev

# 3. 在另一个终端运行类型检查监视
npm run type-check:watch
```

## 📋 常用命令

| 命令 | 描述 |
|------|------|
| `npm run dev` | 启动开发服务器（带热重载） |
| `npm run type-check` | 运行 TypeScript 类型检查 |
| `npm run type-check:watch` | 监视模式类型检查 |
| `npm run lint` | 运行 ESLint 检查 |
| `npm run lint:fix` | 自动修复 ESLint 问题 |
| `npm run format` | 格式化代码（Prettier） |
| `npm run format:check` | 检查代码格式 |
| `npm run build` | 构建项目 |
| `npm test` | 运行测试 |
| `npm run ci` | 本地运行完整 CI 检查 |
| `npm run workflow:verify` | 验证工作流配置 |
| `npm run pre-commit-check` | 手动运行 pre-commit 检查 |

## 🔄 Git 工作流

```bash
# 1. 添加文件
git add .

# 2. 本地运行完整 CI 检查（可选）
npm run ci

# 3. 提交（自动运行类型检查）
git commit -m "feat: 添加新功能"

# 如果检查失败，修复后重新提交
git add .
git commit -m "feat: 添加新功能"
```

## 🎯 VS Code 集成

### 推荐扩展
- ESLint (`dbaeumer.vscode-eslint`)
- Prettier (`esbenp.prettier-vscode`)
- TypeScript (`ms-vscode.vscode-typescript-next`)

### 快捷键
- `Ctrl+Shift+P` (或 `Cmd+Shift+P`) → "Tasks: Run Task" → 选择任务
- `Ctrl+S` → 自动格式化和修复
- `F5` → 运行调试

## ⚡ 自动化流程

### Pre-commit Hook
每次提交时自动执行：
1. ESLint 检查和修复
2. Prettier 格式化
3. TypeScript 类型检查
4. 只有所有检查通过才允许提交

### 监视模式
```bash
# 监视模式类型检查（实时反馈）
npm run type-check:watch

# 监视模式测试
npm run test:watch
```

## 🔧 配置位置

- **TypeScript**: `tsconfig.json`
- **ESLint**: `.eslintrc.json`
- **Prettier**: `.prettierrc`
- **Lint-staged**: `package.json` 中的 `lint-staged` 配置
- **Pre-commit**: `.husky/pre-commit`
- **VS Code**: `.vscode/`

## ❗ 常见错误解决

### TypeScript 错误
```bash
# 查看详细错误
npm run type-check

# 自动修复（如果可能）
npm run lint:fix
npm run format
```

### Pre-commit 失败
```bash
# 手动运行检查
npm run pre-commit-check

# 修复所有问题
npm run lint:fix
npm run format
npm run type-check

# 重新提交
git add .
git commit -m "feat: 添加新功能"
```

## 📚 更多信息

详细文档请参考：[TYPESCRIPT_WORKFLOW.md](TYPESCRIPT_WORKFLOW.md)
