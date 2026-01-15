# Script para gerar APK do Android
# Execute: .\gerar-apk.ps1

Write-Host "`n📱 GERANDO APK PARA ANDROID`n" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

# Verificar se está na pasta mobile
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erro: Execute este script na pasta mobile/" -ForegroundColor Red
    exit 1
}

# Verificar se Android Studio está configurado
$androidHome = $env:ANDROID_HOME
if (-not $androidHome) {
    $androidHome = "$env:LOCALAPPDATA\Android\Sdk"
    if (-not (Test-Path $androidHome)) {
        Write-Host "⚠️  Android SDK não encontrado!" -ForegroundColor Yellow
        Write-Host "   Configure ANDROID_HOME ou instale Android Studio`n" -ForegroundColor Yellow
        Write-Host "   Continuando mesmo assim...`n" -ForegroundColor Gray
    }
}

Write-Host "1️⃣ Verificando se prebuild foi executado..." -ForegroundColor Yellow
if (-not (Test-Path "android")) {
    Write-Host "   Executando prebuild..." -ForegroundColor Gray
    npx expo prebuild
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`n❌ Erro ao executar prebuild" -ForegroundColor Red
        exit 1
    }
    Write-Host "   ✅ Prebuild concluído`n" -ForegroundColor Green
} else {
    Write-Host "   ✅ Pasta android/ encontrada`n" -ForegroundColor Green
}

Write-Host "2️⃣ Gerando APK de debug..." -ForegroundColor Yellow
Write-Host "   Isso pode levar alguns minutos...`n" -ForegroundColor Gray

try {
    Push-Location android
    
    # Limpar builds anteriores
    Write-Host "   Limpando builds anteriores..." -ForegroundColor Gray
    .\gradlew clean 2>&1 | Out-Null
    
    # Gerar APK
    Write-Host "   Compilando APK..." -ForegroundColor Gray
    .\gradlew assembleDebug
    
    if ($LASTEXITCODE -eq 0) {
        $apkPath = "app\build\outputs\apk\debug\app-debug.apk"
        
        if (Test-Path $apkPath) {
            $fullPath = (Resolve-Path $apkPath).Path
            $fileSize = (Get-Item $fullPath).Length / 1MB
            
            Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray
            Write-Host "✅ APK GERADO COM SUCESSO!`n" -ForegroundColor Green
            Write-Host "📦 Arquivo:" -ForegroundColor Cyan
            Write-Host "   $fullPath" -ForegroundColor White
            Write-Host "`n📊 Tamanho: $([math]::Round($fileSize, 2)) MB`n" -ForegroundColor Gray
            
            Write-Host "📱 PRÓXIMOS PASSOS:`n" -ForegroundColor Yellow
            Write-Host "   1. Instalar via ADB (se dispositivo conectado):" -ForegroundColor White
            Write-Host "      adb install `"$fullPath`"`n" -ForegroundColor Gray
            
            Write-Host "   2. OU transferir para o dispositivo:" -ForegroundColor White
            Write-Host "      - Conecte o dispositivo via USB" -ForegroundColor Gray
            Write-Host "      - Copie o arquivo APK para o dispositivo" -ForegroundColor Gray
            Write-Host "      - Ative 'Fontes desconhecidas' nas configurações" -ForegroundColor Gray
            Write-Host "      - Toque no arquivo para instalar`n" -ForegroundColor Gray
            
            # Tentar instalar automaticamente se dispositivo conectado
            $devices = adb devices 2>&1 | Select-String "device$"
            if ($devices) {
                Write-Host "🔌 Dispositivo detectado! Deseja instalar agora? (S/N): " -ForegroundColor Yellow -NoNewline
                $response = Read-Host
                $shouldInstall = ($response -eq "S" -or $response -eq "s")
                if ($shouldInstall) {
                    Write-Host "`n   Instalando no dispositivo..." -ForegroundColor Gray
                    adb install -r $fullPath
                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "   ✅ APK instalado com sucesso!`n" -ForegroundColor Green
                    } else {
                        Write-Host "   ⚠️  Erro ao instalar. Tente manualmente.`n" -ForegroundColor Yellow
                    }
                }
            }
        } else {
            Write-Host "`n❌ APK não encontrado após build" -ForegroundColor Red
            Write-Host "   Verifique os erros acima`n" -ForegroundColor Yellow
        }
    } else {
        Write-Host "`n❌ Erro ao gerar APK" -ForegroundColor Red
        Write-Host "   Verifique os erros acima`n" -ForegroundColor Yellow
    }
    
    Pop-Location
    
} catch {
    Write-Host "`n❌ Erro:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "`n💡 Verifique:" -ForegroundColor Yellow
    Write-Host "   1. Android Studio está instalado" -ForegroundColor White
    Write-Host "   2. ANDROID_HOME está configurado" -ForegroundColor White
    Write-Host "   3. Java JDK está instalado`n" -ForegroundColor White
    Pop-Location
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray
