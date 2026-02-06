@echo off
chcp 65001 >nul
setlocal

echo.
echo  GERANDO APK PARA ANDROID (Release)
echo ============================================================
echo.

cd /d "%~dp0"

if not exist "package.json" (
    echo Erro: Execute este arquivo na pasta mobile.
    pause
    exit /b 1
)

if not exist "android" (
    echo 1. Executando prebuild...
    call npx expo prebuild
    if errorlevel 1 (
        echo Erro ao executar prebuild.
        pause
        exit /b 1
    )
    echo    Prebuild concluido.
) else (
    echo 1. Pasta android encontrada.
)

echo.
echo 2. Gerando APK Release (bundle JS incluido)...
echo    Pode levar alguns minutos...
echo.

cd android

if exist "gradlew.bat" (
    call gradlew.bat clean assembleRelease
) else (
    call gradlew clean assembleRelease
)

if errorlevel 1 (
    echo.
    echo Erro ao gerar APK. Verifique as mensagens acima.
    cd ..
    pause
    exit /b 1
)

set "APK_PATH=app\build\outputs\apk\release\app-release.apk"
if exist "%APK_PATH%" (
    cd ..
    set "FULL_PATH=%cd%\android\app\build\outputs\apk\release\app-release.apk"
    echo.
    echo ============================================================
    echo APK GERADO COM SUCESSO!
    echo ============================================================
    echo.
    echo Arquivo: %FULL_PATH%
    echo.
    echo Instalar: adb install "%FULL_PATH%"
    echo.
) else (
    cd ..
    echo APK nao encontrado apos o build.
)

echo ============================================================
echo.
pause
