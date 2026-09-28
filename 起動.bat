@echo off
chcp 65001 > NUL
title AVアナグラム - 開発サーバー起動

echo ===================================================
echo             AVアナグラム 起動スクリプト
echo ===================================================
echo.

:: 1. Node.js の確認
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo 【エラー】Node.js がインストールされていません。
    echo 公式サイト (https://nodejs.org/) から Node.js をインストールしてください。
    echo.
    pause
    exit /b 1
)

:: 2. node_modules の確認と自動インストール
if not exist "node_modules\" (
    echo 【確認】依存パッケージ未インストールです。
    echo パッケージをインストールしています...
    call npm install
    if %errorlevel% neq 0 (
        echo 【エラー】npm install に失敗しました。
        echo.
        pause
        exit /b 1
    )
    echo 【完了】パッケ一ジのインストールが完了しました。
    echo.
)

:: 3. 開発サーバーの起動とブラウザ自動オープン
echo ---------------------------------------------------
echo 開発サーバーを起動しています...
echo ブラウザで以下のURLにアクセスできます:
echo   http://localhost:5173
echo ---------------------------------------------------
echo.

call npm run dev -- --open

if %errorlevel% neq 0 (
    echo.
    echo 【エラー】開発サーバーの起動中にエラーが発生しました。
)

echo.
pause
