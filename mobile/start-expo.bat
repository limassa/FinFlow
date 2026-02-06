@echo off
REM Script Batch para iniciar o Expo Go (Windows)
REM Uso: start-expo.bat

echo 🚀 Iniciando Expo Go...
echo.

REM Verificar se o Node.js está instalado
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js não encontrado. Por favor, instale o Node.js primeiro.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js encontrado: %NODE_VERSION%

REM Verificar se as dependências estão instaladas
if not exist "node_modules" (
    echo 📦 Instalando dependências...
    call npm install
    echo.
)

REM Verificar se o backend está rodando
echo 🔍 Verificando conexão com o backend...
curl -s --connect-timeout 2 http://localhost:3001/health >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Backend está rodando!
) else (
    echo ⚠️  Backend não está rodando em localhost:3001
    echo    Certifique-se de que o backend está rodando antes de testar o app.
    echo.
)

echo.
echo 📱 Escolha o modo de conexão:
echo    1. Tunnel (recomendado para testes remotos)
echo    2. LAN (para dispositivos na mesma rede)
echo    3. Local (apenas localhost)
echo    4. Padrão (expo start)
echo.
set /p opcao="Digite o número da opção (1-4): "

if "%opcao%"=="1" (
    echo 🌐 Iniciando com Tunnel...
    call npx expo start --tunnel
) else if "%opcao%"=="2" (
    echo 📡 Iniciando com LAN...
    call npx expo start --lan
) else if "%opcao%"=="3" (
    echo 💻 Iniciando em modo Local...
    call npx expo start
) else if "%opcao%"=="4" (
    echo 🚀 Iniciando Expo (padrão)...
    call npx expo start
) else (
    echo ⚠️  Opção inválida. Iniciando no modo padrão...
    call npx expo start
)

echo.
echo 📱 Para conectar:
echo    - iOS: Abra a câmera e escaneie o QR code
echo    - Android: Abra o Expo Go e escaneie o QR code
echo    - Pressione 'a' para abrir no Android emulador
echo    - Pressione 'i' para abrir no iOS emulador
echo    - Pressione 'w' para abrir no navegador
echo    - Pressione 'r' para recarregar
echo    - Pressione 'm' para abrir o menu de desenvolvedor
echo    - Pressione Ctrl+C para parar
echo.

pause

