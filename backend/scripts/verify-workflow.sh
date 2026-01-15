#!/bin/bash

echo "========================================="
echo "TypeScript 工作流验证脚本"
echo "========================================="
echo ""

# 检查 TypeScript 配置
echo "1. 检查 TypeScript 配置..."
if [ -f "tsconfig.json" ]; then
  echo "   ✓ tsconfig.json 存在"
else
  echo "   ✗ tsconfig.json 不存在"
  exit 1
fi

# 检查 ESLint 配置
echo "2. 检查 ESLint 配置..."
if [ -f ".eslintrc.json" ]; then
  echo "   ✓ .eslintrc.json 存在"
else
  echo "   ✗ .eslintrc.json 不存在"
  exit 1
fi

# 检查 Prettier 配置
echo "3. 检查 Prettier 配置..."
if [ -f ".prettierrc" ]; then
  echo "   ✓ .prettierrc 存在"
else
  echo "   ✗ .prettierrc 不存在"
  exit 1
fi

# 检查 lint-staged 配置
echo "4. 检查 lint-staged 配置..."
if grep -q "lint-staged" package.json; then
  echo "   ✓ package.json 中包含 lint-staged 配置"
else
  echo "   ✗ package.json 中缺少 lint-staged 配置"
  exit 1
fi

# 检查 pre-commit hook
echo "5. 检查 pre-commit hook..."
if [ -f ".husky/pre-commit" ]; then
  echo "   ✓ .husky/pre-commit 存在"
  if [ -x ".husky/pre-commit" ]; then
    echo "   ✓ pre-commit hook 可执行"
  else
    echo "   ✗ pre-commit hook 不可执行"
    exit 1
  fi
else
  echo "   ✗ .husky/pre-commit 不存在"
  exit 1
fi

# 检查 VS Code 配置
echo "6. 检查 VS Code 配置..."
if [ -d ".vscode" ]; then
  echo "   ✓ .vscode 目录存在"
else
  echo "   ✗ .vscode 目录不存在"
  exit 1
fi

# 检查关键脚本
echo "7. 检查 npm 脚本..."
REQUIRED_SCRIPTS=("type-check" "lint" "format" "pre-commit-check")
for script in "${REQUIRED_SCRIPTS[@]}"; do
  if grep -q "\"$script\"" package.json; then
    echo "   ✓ npm 脚本 '$script' 已配置"
  else
    echo "   ✗ npm 脚本 '$script' 未配置"
    exit 1
  fi
done

echo ""
echo "========================================="
echo "✅ 所有配置检查通过！"
echo "========================================="
echo ""
echo "可用的 npm 命令："
echo "  npm run type-check        - 运行 TypeScript 类型检查"
echo "  npm run lint              - 运行 ESLint 检查"
echo "  npm run format            - 格式化代码"
echo "  npm run pre-commit-check  - 手动运行 pre-commit 检查"
echo ""
echo "开发工作流："
echo "  1. 开发时：npm run dev"
echo "  2. 类型检查：npm run type-check"
echo "  3. 提交时：自动运行 pre-commit hook"
echo ""
