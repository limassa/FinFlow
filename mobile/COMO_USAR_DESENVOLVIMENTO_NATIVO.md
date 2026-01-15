# 🚀 Como Usar Desenvolvimento Nativo (Solução para Erro Worklets)

## ⚠️ Problema

O erro `WorkletsError` persiste porque o **Expo Go não suporta worklets nativos** do `react-native-reanimated`, que é necessário para o Drawer Navigator funcionar corretamente.

## ✅ Solução: Desenvolvimento Nativo

Desenvolvimento nativo compila o código nativo necessário e permite que o app funcione completamente, incluindo worklets.

## 📋 Pré-requisitos

### Para Android:
- ✅ Android Studio instalado
- ✅ Android SDK configurado
- ✅ Emulador Android configurado OU dispositivo físico conectado via USB com depuração USB ativada

### Para iOS (apenas Mac):
- ✅ Xcode instalado
- ✅ CocoaPods instalado (`sudo gem install cocoapods`)
- ✅ Simulador iOS OU dispositivo físico conectado

## 🔧 Passo a Passo

### 1. Preparar o Projeto

```powershell
cd mobile
npx expo prebuild
```

Este comando irá:
- Criar as pastas `android/` e `ios/` com código nativo
- Configurar o projeto para desenvolvimento nativo
- Instalar dependências nativas necessárias

### 2. Instalar Dependências Nativas (Android)

```powershell
cd android
.\gradlew clean
cd ..
```

### 3. Executar no Android

**Opção A - Emulador Android:**
```powershell
# Certifique-se de que o emulador está rodando
npx expo run:android
```

**Opção B - Dispositivo Físico:**
```powershell
# Conecte o dispositivo via USB
# Ative a depuração USB nas opções de desenvolvedor
npx expo run:android
```

### 4. Executar no iOS (apenas Mac)

```powershell
cd ios
pod install
cd ..
npx expo run:ios
```

## 🎯 Vantagens do Desenvolvimento Nativo

✅ **Suporte completo para worklets** - Reanimated funciona perfeitamente
✅ **Melhor performance** - Código nativo compilado
✅ **Acesso a todas as APIs nativas** - Sem limitações do Expo Go
✅ **Debugging nativo** - Logs e ferramentas de debug completas
✅ **Hot Reload funciona** - Desenvolvimento rápido

## 🔄 Desenvolvimento Contínuo

Após o primeiro build, você pode usar:

```powershell
# Iniciar Metro Bundler
npm start

# Em outro terminal, executar o app
npx expo run:android  # ou run:ios
```

O Metro Bundler irá recarregar automaticamente quando você fizer mudanças no código.

## 📱 Scripts Úteis

Adicione estes scripts ao `package.json`:

```json
{
  "scripts": {
    "android": "npx expo run:android",
    "ios": "npx expo run:ios",
    "prebuild": "npx expo prebuild",
    "prebuild:clean": "npx expo prebuild --clean"
  }
}
```

Então você pode usar:
```powershell
npm run android
npm run ios
```

## ⚠️ Notas Importantes

1. **Primeira vez pode demorar:**
   - O `prebuild` e o primeiro build podem levar vários minutos
   - Isso é normal, builds subsequentes serão mais rápidos

2. **Pastas android/ e ios/:**
   - Essas pastas são geradas automaticamente
   - Você pode editá-las se necessário
   - Use `npx expo prebuild --clean` para regenerar

3. **Git:**
   - Considere adicionar `android/` e `ios/` ao `.gitignore` se não quiser versioná-las
   - Ou versioná-las se quiser manter configurações específicas

## 🐛 Troubleshooting

### Erro: "SDK location not found"
```powershell
# Configure a variável de ambiente ANDROID_HOME
# Windows PowerShell:
$env:ANDROID_HOME = "C:\Users\SeuUsuario\AppData\Local\Android\Sdk"
```

### Erro: "Gradle build failed"
```powershell
cd android
.\gradlew clean
cd ..
npx expo prebuild --clean
npx expo run:android
```

### Erro: "Pod install failed" (iOS)
```powershell
cd ios
pod deintegrate
pod install
cd ..
```

## ✅ Após Configurar

Uma vez configurado, o desenvolvimento nativo é mais rápido e confiável que o Expo Go para apps que usam worklets e animações nativas.

## 📚 Referências

- [Expo Development Build](https://docs.expo.dev/development/introduction/)
- [React Native Reanimated - Installation](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/)
- [Expo Prebuild](https://docs.expo.dev/workflow/prebuild/)



