# CI/CD 快速参考

## 🚀 快速开始

```bash
# 本地运行完整 CI 检查
npm run ci

# 验证工作流配置
npm run workflow:verify
```

## 📊 GitHub Actions 工作流

### 自动触发
- **推送到 `main`/`develop`** - 运行完整 CI 检查
- **提交 Pull Request** - 运行完整 CI 检查
- **每周六** - CodeQL 安全扫描

### 工作流文件
| 工作流 | 文件 | 功能 |
|--------|------|------|
| CI | `.github/workflows/ci.yml` | 类型检查、代码检查、测试、构建 |
| CodeQL | `.github/workflows/codeql.yml` | 静态代码分析、安全扫描 |
| 依赖审查 | `.github/workflows/dependency-review.yml` | 依赖安全审查 |

## 🔍 检查项目

### CI Pipeline
1. ✅ **TypeScript 类型检查**
   - 验证类型安全
   - 检查未使用变量

2. ✅ **ESLint 代码质量**
   - 代码风格检查
   - 潜在问题发现

3. ✅ **Jest 测试**
   - 单元测试
   - 集成测试
   - 代码覆盖率

4. ✅ **项目构建**
   - TypeScript 编译
   - 生成构建产物

### 安全扫描
5. ✅ **CodeQL 分析**
   - 安全漏洞检测
   - 代码质量分析

6. ✅ **依赖审查**
   - 检查已知安全漏洞
   - 审查新增依赖

## 📋 常用命令

| 命令 | 描述 |
|------|------|
| `npm run ci` | 本地运行完整 CI 检查 |
| `npm run workflow:verify` | 验证工作流配置 |
| `npm run type-check` | TypeScript 类型检查 |
| `npm run lint` | ESLint 检查 |
| `npm test` | 运行测试 |
| `npm run build` | 构建项目 |

## 🔧 Pull Request 检查

每个 PR 都会自动运行：
- [ ] Type Check ✅
- [ ] Lint ✅
- [ ] Test ✅
- [ ] Build ✅
- [ ] CodeQL ✅
- [ ] Dependency Review ✅

**只有所有检查通过，PR 才能合并**

## 📈 覆盖率

```bash
# 查看覆盖率报告
open coverage/lcov-report/index.html
```

- 目标覆盖率：>80%
- 覆盖率报告上传到 Codecov
- 集成到 PR 检查中

## 🐛 故障排除

### CI 失败
```bash
# 本地模拟 CI
npm run ci

# 查看详细错误
cat /tmp/*.log
```

### 常见问题
| 问题 | 解决方案 |
|------|----------|
| 类型错误 | `npm run type-check` |
| Lint 失败 | `npm run lint:fix` |
| 格式化问题 | `npm run format` |
| 测试失败 | `npm test` |
| 构建错误 | `npm run build` |

## 📚 完整文档

详细文档：[CI_CD.md](CI_CD.md)
