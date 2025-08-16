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

# 創建自定義 _headers 文件，確保正確的 MIME 類型
echo "創建 _headers 文件，設置正確的 MIME 類型..."
cat > dist/_headers << EOL
# 設置所有 JavaScript 文件的 MIME 類型
/assets/*.js
  Content-Type: application/javascript

# 設置所有 CSS 文件的 MIME 類型
/assets/*.css
  Content-Type: text/css
EOL

echo "構建成功完成！"

# 部署到 GitHub Pages
echo "部署到 GitHub Pages..."
npx gh-pages -d dist -m "Deploy to GitHub Pages"

echo "完成部署！"
