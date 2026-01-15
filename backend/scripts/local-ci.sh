#!/bin/bash

echo "========================================="
echo "本地 CI 模拟脚本"
echo "模拟 GitHub Actions CI 工作流"
echo "========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 错误计数器
ERRORS=0

# 函数：打印状态
print_status() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✓${NC} $2"
  else
    echo -e "${RED}✗${NC} $2"
    ((ERRORS++))
  fi
}

# 函数：打印步骤
print_step() {
  echo ""
  echo -e "${YELLOW}=== $1 ===${NC}"
}

# 步骤 1: 类型检查
print_step "步骤 1: TypeScript 类型检查"
echo "运行: npm run type-check"
if npm run type-check > /tmp/type-check.log 2>&1; then
  print_status 0 "TypeScript 类型检查通过"
else
  print_status 1 "TypeScript 类型检查失败"
  echo "错误日志:"
  cat /tmp/type-check.log
fi

# 步骤 2: ESLint 检查
print_step "步骤 2: ESLint 代码质量检查"
echo "运行: npm run lint"
if npm run lint > /tmp/lint.log 2>&1; then
  print_status 0 "ESLint 检查通过"
else
  print_status 1 "ESLint 检查失败"
  echo "错误日志:"
  cat /tmp/lint.log
fi

# 步骤 3: 代码格式化检查
print_step "步骤 3: 代码格式化检查"
echo "运行: npm run format:check"
if npm run format:check > /tmp/format.log 2>&1; then
  print_status 0 "代码格式化检查通过"
else
  print_status 1 "代码格式化检查失败"
  echo "建议运行: npm run format"
fi

# 步骤 4: 运行测试
print_step "步骤 4: Jest 测试"
echo "运行: npm test"
if npm test > /tmp/test.log 2>&1; then
  print_status 0 "所有测试通过"
  # 提取覆盖率信息
  if [ -f "coverage/lcov.info" ]; then
    echo "  覆盖率报告: coverage/lcov-report/index.html"
  fi
else
  print_status 1 "测试失败"
  echo "错误日志:"
  tail -50 /tmp/test.log
fi

# 步骤 5: 构建项目
print_step "步骤 5: 项目构建"
echo "运行: npm run build"
if npm run build > /tmp/build.log 2>&1; then
  print_status 0 "项目构建成功"
  echo "  构建输出: dist/"
else
  print_status 1 "项目构建失败"
  echo "错误日志:"
  cat /tmp/build.log
fi

# 总结
echo ""
echo "========================================="
echo "CI 模拟结果"
echo "========================================="

if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ 所有检查通过！${NC}"
  echo ""
  echo "可以安全提交代码到仓库。"
  echo ""
  echo "下一步："
  echo "  git add ."
  echo "  git commit -m 'feat: 您的提交信息'"
  echo "  git push"
  exit 0
else
  echo -e "${RED}❌ 发现 $ERRORS 个错误${NC}"
  echo ""
  echo "请修复上述错误后重新运行此脚本。"
  echo ""
  echo "常用修复命令："
  echo "  npm run lint:fix    # 自动修复 ESLint 问题"
  echo "  npm run format      # 自动格式化代码"
  echo ""
  exit 1
fi
