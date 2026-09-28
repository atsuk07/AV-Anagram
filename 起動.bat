@echo off
chcp 65001 >nul
title AVアナグラム - 開発サーバー起動

:: このbatファイルがあるフォルダへ移動
cd /d "%~dp0"

echo ===================================================
echo             AVアナグラム 起動スクリプト
echo ===================================================
echo.

:: Node.jsの確認
where node >nul 2>nul
if errorlevel 1 (
    echo 【エラー】Node.jsが見つかりません。
    echo.
    pause
    exit /b 1
)

:: node_modulesの確認
if not exist "node_modules\" (
    echo 【確認】依存パッケージをインストールしています...
    call npm install
    if errorlevel 1 (
        echo 【エラー】npm installに失敗しました。
        echo.
        pause
        exit /b 1
    )
)

echo ---------------------------------------------------
echo 開発サーバーを起動しています...
echo http://localhost:5173
echo ---------------------------------------------------
echo.

node ".\node_modules\vite\bin\vite.js" --host 127.0.0.1 --port 5173 --open

echo.
echo 開発サーバーが終了しました。
pause