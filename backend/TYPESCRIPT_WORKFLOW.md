# TypeScript 类型检查工作流

本文档描述了 HR 系统后端的 TypeScript 类型检查工作流。

## 概述

我们的项目使用严格的 TypeScript 类型检查来确保代码质量和类型安全。所有代码在提交前都会自动进行类型检查。

## 配置说明

### TypeScript 配置 (tsconfig.json)

我们使用严格的 TypeScript 配置：

- `strict: true` - 启用所有严格类型检查选项
- `noImplicitAny: true` - 禁止隐式 any 类型
- `strictNullChecks: true` - 严格的 null 检查
- `noUnusedLocals: true` - 检查未使用的局部变量
- `noUnusedParameters: true` - 检查未使用的参数

### Pre-commit Hooks

项目配置了 Git pre-commit hooks 来确保代码质量：

- 自动运行 ESLint 检查和修复
- 自动运行 Prettier 格式化
- 运行 TypeScript 类型检查
- 只有在所有检查通过时才允许提交

## 可用命令

### 开发命令

```bash
# 开发模式（带热重载）
npm run dev

# 类型检查（不生成文件）
npm run type-check

# 监视模式类型检查
npm run type-check:watch

# 构建项目
npm run build

# 运行生产版本
npm start
```

### 代码质量命令

```bash
# 运行 ESLint 检查
npm run lint

# 自动修复 ESLint 问题
npm run lint:fix

# 格式化代码（Prettier）
npm run format

# 检查代码格式
npm run format:check

# 手动运行 pre-commit 检查
npm run pre-commit-check
```

### 测试命令

```bash
# 运行测试
npm test

# 监视模式运行测试
npm run test:watch
```

## IDE 集成

### VS Code 设置

项目包含 VS Code 配置文件，提供以下功能：

- 保存时自动格式化
- 保存时自动修复 ESLint 问题
- 自动导入优化
- 隐藏构建输出文件

### 推荐扩展

在 VS Code 中安装以下扩展：

- **ESLint** (`dbaeumer.vscode-eslint`) - ESLint 集成
- **Prettier** (`esbenp.prettier-vscode`) - 代码格式化
- **TypeScript** (`ms-vscode.vscode-typescript-next`) - TypeScript 支持

### VS Code 任务

在 VS Code 中按 `Ctrl+Shift+P`（或 `Cmd+Shift+P`），输入 "Tasks: Run Task"，可以选择：

- **Type Check** - 运行类型检查
- **Type Check Watch** - 监视模式类型检查
- **Lint** - 运行代码检查
- **Build** - 构建项目
- **Test** - 运行测试

## 开发工作流

### 1. 日常开发

```bash
# 1. 启动开发服务器
npm run dev

# 2. 在另一个终端运行类型检查监视
npm run type-check:watch
```

### 2. 提交代码

```bash
# 1. 添加文件到 git
git add .

# 2. 提交（会自动运行 pre-commit hooks）
git commit -m "feat: 添加新功能"

# 如果 pre-commit 检查失败，修复问题后重新提交
git add .
git commit -m "feat: 添加新功能"
```

### 3. 手动检查

```bash
# 运行完整的代码质量检查
npm run lint
npm run type-check
npm test
```

## 常见问题

### Q: TypeScript 编译错误如何解决？

A: 首先运行 `npm run type-check` 查看具体错误，然后：

1. 检查类型定义是否正确
2. 确保所有变量都有类型注解
3. 检查导入路径是否正确
4. 使用 `noImplicitAny` 避免使用 any 类型

### Q: ESLint 报错如何解决？

A: 运行 `npm run lint:fix` 自动修复大部分问题，或：

1. 查看 ESLint 输出了解具体错误
2. 手动修复代码样式问题
3. 添加必要的类型注解

### Q: Pre-commit hook 失败怎么办？

A: Pre-commit hook 失败会阻止提交：

1. 查看错误信息
2. 修复所有 TypeScript 类型错误
3. 运行 `npm run lint:fix` 修复代码样式问题
4. 重新提交

### Q: 如何跳过 pre-commit 检查？

A: 不建议跳过，但紧急情况下可以使用：

```bash
git commit --no-verify -m "紧急提交"
```

## 最佳实践

1. **始终运行类型检查**：在提交前确保 `npm run type-check` 通过
2. **使用 TypeScript 严格模式**：避免使用 any 类型
3. **启用 IDE 集成**：使用 VS Code 扩展获得实时反馈
4. **编写类型安全代码**：为所有函数和变量提供明确的类型
5. **定期更新依赖**：保持 TypeScript 和相关工具的最新版本

## 相关资源

- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [ESLint 规则](https://eslint.org/docs/rules/)
- [Prettier 配置](https://prettier.io/docs/en/configuration.html)
- [Husky Git Hooks](https://typicode.github.io/husky/)
- [Lint Staged](https://github.com/okonet/lint-staged)
