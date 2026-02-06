# Script para gerar APK do Android (release = bundle JS incluido, funciona sem Metro)
# Execute na pasta mobile: .\gerar-apk.ps1

Write-Host "`n📱 GERANDO APK PARA ANDROID (Release)`n" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erro: Execute este script na pasta mobile/" -ForegroundColor Red
    exit 1
}

$androidHome = $env:ANDROID_HOME
if (-not $androidHome) {
    $androidHome = "$env:LOCALAPPDATA\Android\Sdk"
    if (-not (Test-Path $androidHome)) {
        Write-Host "⚠️  Android SDK nao encontrado. Configure ANDROID_HOME. Continuando...`n" -ForegroundColor Yellow
    }
}

Write-Host "1️⃣ Verificando pasta android/..." -ForegroundColor Yellow
if (-not (Test-Path "android")) {
    Write-Host "   Executando prebuild..." -ForegroundColor Gray
    npx expo prebuild
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`n❌ Erro ao executar prebuild" -ForegroundColor Red
        exit 1
    }
    Write-Host "   ✅ Prebuild concluido`n" -ForegroundColor Green
}
else {
    Write-Host "   ✅ Pasta android/ encontrada`n" -ForegroundColor Green
}

# Release inclui o bundle JS no APK; debug nao inclui (por isso "Unable to load script")
Write-Host "2️⃣ Gerando APK Release (bundle JS incluido)..." -ForegroundColor Yellow
Write-Host "   Pode levar alguns minutos...`n" -ForegroundColor Gray

$gradleCmd = ".\gradlew.bat"
if (-not (Test-Path "android\gradlew.bat")) {
    $gradleCmd = ".\gradlew"
}

Push-Location android

# Limpar e gerar release (release inclui o JS no APK; debug nao inclui)
& $gradleCmd clean assembleRelease 2>&1 | ForEach-Object { Write-Host $_ }

$buildOk = ($LASTEXITCODE -eq 0)
$apkPath = "app\build\outputs\apk\release\app-release.apk"

if ($buildOk -and (Test-Path $apkPath)) {
    $fullPath = (Resolve-Path $apkPath).Path
    $fileSize = (Get-Item $fullPath).Length / 1MB

    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray
    Write-Host "✅ APK GERADO COM SUCESSO!`n" -ForegroundColor Green
    Write-Host "📦 Arquivo:" -ForegroundColor Cyan
    Write-Host "   $fullPath" -ForegroundColor White
    Write-Host "`n📊 Tamanho: $([math]::Round($fileSize, 2)) MB`n" -ForegroundColor Gray
    Write-Host "📱 Instalar: adb install `"$fullPath`"`n" -ForegroundColor Yellow
}
else {
    Write-Host "`n❌ Erro ao gerar APK ou arquivo nao encontrado" -ForegroundColor Red
    Write-Host "   Verifique os erros acima. Use assembleRelease para incluir o JS no APK.`n" -ForegroundColor Yellow
}

Pop-Location
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray
