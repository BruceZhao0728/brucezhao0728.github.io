    @echo off
chcp 65001 >nul
echo ========================================
echo    个人网站 - 本地服务器启动器
echo ========================================
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✓ 检测到Python，正在启动服务器...
    echo.
    echo 服务器地址: http://localhost:8000
    echo 按 Ctrl+C 停止服务器
    echo.
    python -m http.server 8000
) else (
    echo ✗ 未检测到Python
    echo.
    echo 请安装Python后重试，或使用以下方式运行：
    echo.
    echo 方式1: 安装Python
    echo   访问 https://www.python.org/downloads/
    echo.
    echo 方式2: 使用VS Code的Live Server扩展
    echo   1. 安装Live Server扩展
    echo   2. 右键index.html，选择"Open with Live Server"
    echo.
    echo 方式3: 使用Node.js
    echo   npm install -g http-server
    echo   http-server -p 8000
    echo.
    pause
)
