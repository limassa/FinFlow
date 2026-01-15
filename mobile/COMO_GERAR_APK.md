# 📱 Como Gerar APK para Android

Este guia mostra como gerar um APK instalável para testar no Android.

## 🎯 Opções Disponíveis

### Opção 1: EAS Build (Recomendado - Mais Fácil)
- ✅ Não precisa configurar Android Studio
- ✅ Build na nuvem
- ✅ Mais rápido e simples
- ⚠️ Requer conta Expo (gratuita)

### Opção 2: Build Local (Mais Controle)
- ✅ Build local na sua máquina
- ✅ Não precisa de conta Expo
- ⚠️ Requer Android Studio configurado
- ⚠️ Mais demorado

---

## 🚀 Opção 1: EAS Build (Recomendado)

### 1. Instalar EAS CLI

```powershell
npm install -g eas-cli
```

### 2. Fazer Login no Expo

```powershell
eas login
```

Crie uma conta gratuita se não tiver.

### 3. Configurar EAS Build

```powershell
cd mobile
eas build:configure
```

Isso criará um arquivo `eas.json` com as configurações.

### 4. Gerar APK de Desenvolvimento

```powershell
eas build --platform android --profile development
```

### 5. Gerar APK de Produção

```powershell
eas build --platform android --profile production
```

### 6. Baixar o APK

Após o build concluir:
- Você receberá um link para download
- Ou execute: `eas build:list` para ver seus builds
- Baixe o APK diretamente do link

### 7. Instalar no Dispositivo

```powershell
# Via ADB (se dispositivo conectado)
adb install caminho/para/o.apk

# Ou transfira o arquivo para o dispositivo e instale manualmente
```

---

## 🔧 Opção 2: Build Local (Android Studio)

### Pré-requisitos

- ✅ Android Studio instalado
- ✅ Android SDK configurado
- ✅ Variável `ANDROID_HOME` configurada
- ✅ Java JDK instalado

### 1. Preparar o Projeto

```powershell
cd mobile
npx expo prebuild
```

### 2. Abrir no Android Studio

```powershell
# Abrir a pasta android no Android Studio
start android
```

Ou abra manualmente: `File > Open > selecione pasta android/`

### 3. Configurar Assinatura (Opcional para Teste)

Para APK de teste, você pode usar uma assinatura de debug (já configurada).

### 4. Gerar APK de Debug

**No Android Studio:**
1. Menu: `Build > Build Bundle(s) / APK(s) > Build APK(s)`
2. Aguarde o build concluir
3. Clique em `locate` quando aparecer a notificação
4. O APK estará em: `android/app/build/outputs/apk/debug/app-debug.apk`

**Ou via linha de comando:**
```powershell
cd android
.\gradlew assembleDebug
```

O APK estará em: `android/app/build/outputs/apk/debug/app-debug.apk`

### 5. Gerar APK de Release (Assinado)

**Criar keystore (primeira vez):**
```powershell
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

**Configurar gradle:**
Edite `android/gradle.properties` e adicione:
```properties
MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=my-key-alias
MYAPP_RELEASE_STORE_PASSWORD=sua_senha
MYAPP_RELEASE_KEY_PASSWORD=sua_senha
```

**Gerar APK de release:**
```powershell
cd android
.\gradlew assembleRelease
```

O APK estará em: `android/app/build/outputs/apk/release/app-release.apk`

### 6. Instalar no Dispositivo

```powershell
# Via ADB
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Ou transfira o arquivo para o dispositivo e instale manualmente
```

---

## ⚡ Script Rápido (Build Local)

Criei um script para facilitar:

```powershell
.\gerar-apk.ps1
```

---

## 📋 Configurações do app.json

Certifique-se de que o `app.json` está configurado:

```json
{
  "expo": {
    "name": "FinFlow",
    "slug": "finflow-mobile",
    "version": "1.0.0",
    "android": {
      "package": "com.lizsoftwares.finflow",
      "adaptiveIcon": {
        "backgroundColor": "#4a67af"
      }
    }
  }
}
```

---

## 🔍 Verificar APK Gerado

### Informações do APK:
```powershell
# Usando aapt (Android SDK)
aapt dump badging caminho/para/o.apk
```

### Instalar e Testar:
1. Transfira o APK para o dispositivo Android
2. Ative "Fontes desconhecidas" nas configurações
3. Toque no arquivo APK para instalar
4. Abra o app e teste

---

## 🐛 Troubleshooting

### Erro: "SDK location not found"
```powershell
# Configure ANDROID_HOME
$env:ANDROID_HOME = "C:\Users\SeuUsuario\AppData\Local\Android\Sdk"
$env:PATH += ";$env:ANDROID_HOME\platform-tools"
```

### Erro: "Gradle build failed"
```powershell
cd android
.\gradlew clean
cd ..
npx expo prebuild --clean
```

### Erro: "Keystore not found" (Release)
- Certifique-se de criar o keystore primeiro
- Verifique o caminho no `gradle.properties`

---

## ✅ Recomendações

1. **Para testes rápidos:** Use APK de debug (não precisa assinar)
2. **Para distribuição:** Use APK de release (assinado)
3. **Para produção:** Considere usar Google Play Store ou EAS Build

---

## 📚 Referências

- [Expo EAS Build](https://docs.expo.dev/build/introduction/)
- [Android Build Guide](https://reactnative.dev/docs/signed-apk-android)
- [Expo Build Local](https://docs.expo.dev/build-reference/local-builds/)



