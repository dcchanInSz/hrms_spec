# 持续集成 (CI/CD) 工作流

本文档描述了 HR 系统的持续集成和持续部署工作流。

## 概述

我们使用 GitHub Actions 来自动化代码质量检查、测试和部署流程。每个 Pull Request 和代码提交都会触发自动化检查。

## 工作流类型

### 1. CI (持续集成) - `.github/workflows/ci.yml`

**触发条件：**
- 推送到 `main` 或 `develop` 分支
- 向 `main` 分支提交 Pull Request

**执行阶段：**

#### 类型检查 (Type Check)
```bash
npm run type-check
```
- 运行 TypeScript 编译器进行类型检查
- 确保所有类型安全
- 检查未使用的变量和参数

#### 代码质量检查 (Lint)
```bash
npm run lint
```
- 运行 ESLint 检查代码质量
- 检查代码风格和潜在问题
- 自动修复可修复的问题

#### 测试 (Test)
```bash
npm test
```
- 运行单元测试和集成测试
- 生成代码覆盖率报告
- 上传覆盖率到 Codecov

#### 构建 (Build)
- 只有在前面的检查通过后才执行
- 编译 TypeScript 代码
- 生成构建产物
- 上传构建产物作为 Artifacts

### 2. CodeQL 分析 - `.github/workflows/codeql.yml`

**触发条件：**
- 推送到 `main` 分支
- 向 `main` 分支提交 Pull Request
- 每周六自动运行

**功能：**
- 静态代码分析
- 安全漏洞检测
- 代码质量问题分析
- 自动生成安全报告

### 3. 依赖审查 - `.github/workflows/dependency-review.yml`

**触发条件：**
- 向 `main` 分支提交 Pull Request

**功能：**
- 检查依赖项的安全漏洞
- 审查新增依赖项
- 阻止包含严重安全问题的合并

## 工作流状态徽章

可以在 README.md 中添加状态徽章：

```markdown
![CI](https://github.com/your-org/hrms/workflows/CI/badge.svg)
![CodeQL](https://github.com/your-org/hrms/workflows/CodeQL/badge.svg)
![Dependency Review](https://github.com/your-org/hrms/workflows/Dependency%20Review/badge.svg)
```

## 本地运行检查

在提交代码前，建议本地运行所有检查：

```bash
# 1. 类型检查
npm run type-check

# 2. 代码质量检查
npm run lint

# 3. 代码格式化检查
npm run format:check

# 4. 运行测试
npm test

# 5. 构建项目
npm run build
```

## Pull Request 检查清单

创建 Pull Request 时，系统会自动运行以下检查：

- [ ] **Type Check** - TypeScript 类型检查
- [ ] **Lint** - ESLint 代码质量检查
- [ ] **Test** - 测试套件
- [ ] **Build** - 项目构建
- [ ] **CodeQL** - 静态代码分析
- [ ] **Dependency Review** - 依赖项安全审查

只有所有检查通过，Pull Request 才能合并到 `main` 分支。

## 常见问题

### Q: CI 检查失败怎么办？

A: 检查失败时，请：

1. 点击 GitHub 仓库中的 "Actions" 标签查看详细日志
2. 根据错误信息修复问题
3. 推送修复后的代码

常见失败原因：
- TypeScript 类型错误
- ESLint 检查失败
- 测试用例失败
- 构建错误

### Q: 如何跳过某些检查？

A: 不建议跳过任何检查。如果必须跳过：

```bash
# 跳过 pre-commit hooks
git commit --no-verify -m "紧急修复"

# 注意：CI 检查无法跳过
```

### Q: 如何提高测试覆盖率？

A: 运行测试覆盖率报告：

```bash
npm test -- --coverage
```

覆盖率报告位置：`coverage/lcov-report/index.html`

确保新代码有适当的测试覆盖。

### Q: CodeQL 报告了安全问题？

A: 如果 CodeQL 报告安全问题：

1. 查看 GitHub Security 标签中的警报
2. 修复所有高危和中危问题
3. 如果是误报，可以添加注释抑制警报：

```javascript
// eslint-disable-next-line security/detect-object-injection
// 或
// codeql-disable-next-line
```

## 最佳实践

1. **频繁提交** - 小而频繁的提交更容易调试
2. **编写测试** - 确保代码有适当的测试覆盖
3. **修复告警** - 及时修复 CI 检查发现的问题
4. **审查依赖** - 定期审查和更新依赖项
5. **安全优先** - 不要忽视安全警告

## 配置

### 环境变量

CI 环境需要以下环境变量：

```env
NODE_ENV=production
JWT_SECRET=<your-secret>
DATABASE_URL=<database-connection-string>
```

### 缓存

GitHub Actions 使用 npm 缓存来加速构建：

- 缓存路径：`backend/package-lock.json`
- 缓存键：基于 package-lock.json 的哈希
- 缓存保留时间：最长 7 天

### 并行执行

- Type Check、Lint、Test 可以并行执行
- Build 依赖前面所有检查通过
- CodeQL 独立运行

## 监控

### Codecov 集成

测试覆盖率报告自动上传到 Codecov：
- 查看覆盖率趋势
- 设置覆盖率目标
- 集成到 PR 检查中

### GitHub Security

CodeQL 发现的安全问题会显示在：
- Pull Request 检查中
- 仓库的 Security 标签中
- 安全邮件通知中

## 相关资源

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [CodeQL 文档](https://codeql.github.com/docs/)
- [Dependency Review 文档](https://docs.github.com/en/code-security/supply-chain-security/understanding-your-supply-chain/dependency-review)
- [Codecov 文档](https://docs.codecov.com/docs)
