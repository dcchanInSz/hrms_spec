#!/bin/bash

echo "========================================="
echo "CI/CD 工作流验证脚本"
echo "========================================="
echo ""

# 检查 GitHub Actions 工作流
echo "1. 检查 GitHub Actions 工作流..."
if [ -d "../.github/workflows" ]; then
  echo "   ✓ .github/workflows 目录存在"

  WORKFLOWS=("ci.yml" "codeql.yml" "dependency-review.yml")
  for workflow in "${WORKFLOWS[@]}"; do
    if [ -f "../.github/workflows/$workflow" ]; then
      echo "   ✓ $workflow 存在"
    else
      echo "   ✗ $workflow 不存在"
      exit 1
    fi
  done
else
  echo "   ✗ .github/workflows 目录不存在"
  exit 1
fi

# 检查 package.json 中的 CI 脚本
echo "2. 检查 package.json 中的 CI 脚本..."
REQUIRED_SCRIPTS=("type-check" "lint" "test" "build")
for script in "${REQUIRED_SCRIPTS[@]}"; do
  if grep -q "\"$script\"" package.json; then
    echo "   ✓ 脚本 '$script' 已配置"
  else
    echo "   ✗ 脚本 '$script' 未配置"
    exit 1
  fi
done

# 检查测试配置
echo "3. 检查测试配置..."
if grep -q '"jest"' package.json; then
  echo "   ✓ Jest 测试配置存在"
else
  echo "   ✗ Jest 测试配置不存在"
  exit 1
fi

# 检查覆盖率配置
echo "4. 检查覆盖率配置..."
if grep -q '"collectCoverageFrom"' package.json; then
  echo "   ✓ 覆盖率配置存在"
else
  echo "   ✗ 覆盖率配置不存在"
  exit 1
fi

# 检查 TypeScript 配置
echo "5. 检查 TypeScript 配置..."
if grep -q '"noUnusedLocals"' tsconfig.json; then
  echo "   ✓ TypeScript 严格模式已启用"
else
  echo "   ✗ TypeScript 严格模式未启用"
  exit 1
fi

echo ""
echo "========================================="
echo "✅ 所有 CI/CD 配置检查通过！"
echo "========================================="
echo ""
echo "GitHub Actions 工作流："
echo "  ✓ ci.yml - 持续集成检查"
echo "  ✓ codeql.yml - 静态代码分析"
echo "  ✓ dependency-review.yml - 依赖审查"
echo ""
echo "触发条件："
echo "  - 推送到 main 或 develop 分支"
echo "  - 向 main 分支提交 Pull Request"
echo "  - 每周六自动运行 CodeQL"
echo ""
echo "检查项目："
echo "  1. TypeScript 类型检查"
echo "  2. ESLint 代码质量检查"
echo "  3. Jest 测试和覆盖率"
echo "  4. 项目构建"
echo "  5. CodeQL 安全分析"
echo "  6. 依赖项安全审查"
echo ""
