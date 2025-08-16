#!/bin/bash

# 確保我們在正確的目錄
cd "$(dirname "$0")/.."

# 清除舊的構建文件
echo "清除舊的構建文件..."
rm -rf dist

# 執行 Vite 構建
echo "執行 Vite 構建..."
NODE_ENV=production npx vite build

# 確保 .nojekyll 文件存在
echo "確保 .nojekyll 文件存在..."
touch dist/.nojekyll

# 複製構建文件到根目錄（為 GitHub Pages main 分支的根目錄部署做準備）
echo "複製構建文件到 docs 目錄（GitHub Pages 可以從 /docs 資料夾部署）..."
rm -rf docs
mkdir -p docs
cp -r dist/* docs/
touch docs/.nojekyll

echo "構建和複製文件完成！現在您可以將變更推送到 GitHub main 分支："
echo "git add ."
echo "git commit -m \"Deploy to GitHub Pages\""
echo "git push origin main"
echo ""
echo "別忘了在 GitHub 中將 Pages 來源設定為 'Deploy from a branch' 並選擇 'main' 分支的 '/docs' 資料夾"
