#!/bin/bash
# 一键部署脚本 — 构建并推送 gh-pages 分支
# 用法: bash deploy.sh

set -e

echo "=== 1. 构建站点 ==="
npx hexo generate

echo "=== 2. 准备 gh-pages 分支 ==="
rm -rf .deploy_tmp
mkdir .deploy_tmp
cp -r public/* .deploy_tmp/
touch .deploy_tmp/.nojekyll

echo "=== 3. 推送到 gh-pages ==="
git checkout gh-pages 2>/dev/null || git checkout --orphan gh-pages
git rm -rf . 2>/dev/null || true
cp -r ../.deploy_tmp/* .
cp ../.deploy_tmp/.nojekyll .
git add -A
git commit -m "deploy: $(date +%Y-%m-%d)"
git push origin gh-pages

echo "=== 4. 清理 ==="
git checkout main
rm -rf .deploy_tmp
echo "=== 部署完成！==="
