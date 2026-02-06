# 🔄 Atualização para Expo SDK 51

## Mudanças Realizadas

### 1. Atualização do Expo
- **Antes**: Expo SDK 49
- **Agora**: Expo SDK 51

### 2. Dependências Atualizadas

| Pacote | Versão Anterior | Versão Atual |
|--------|----------------|--------------|
| expo | ~49.0.0 | ~51.0.0 |
| react-native | 0.72.6 | 0.74.5 |
| expo-status-bar | ~1.6.0 | ~1.12.1 |
| react-native-screens | ~3.22.0 | ~3.31.1 |
| react-native-safe-area-context | 4.6.3 | 4.10.5 |
| react-native-gesture-handler | ~2.12.0 | ~2.16.1 |
| expo-secure-store | ~12.3.1 | ~13.0.2 |
| @expo/vector-icons | ^13.0.0 | ^14.0.0 |
| react-native-svg | 13.9.0 | 15.2.0 |

### 3. Assets Temporariamente Removidos

Os assets (ícones e splash screen) foram temporariamente removidos do `app.json` para permitir que o app inicie sem erros. O app funcionará normalmente, mas sem ícone personalizado.

## 📱 Próximos Passos

### Adicionar Assets (Opcional)

Para adicionar ícones e splash screen personalizados:

1. Crie os arquivos na pasta `assets/`:
   - `icon.png` (1024x1024)
   - `splash.png` (1242x2436)
   - `adaptive-icon.png` (1024x1024) - Android

2. Adicione de volta no `app.json`:
```json
{
  "expo": {
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#4a67af"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#4a67af"
      }
    }
  }
}
```

## ✅ Teste Agora

Execute:
```bash
npm start
```

O app deve iniciar sem erros de assets ou versão incompatível.

## 🔧 Se Houver Problemas

1. Limpe o cache:
```bash
npm run start:clear
```

2. Reinstale as dependências:
```bash
rm -rf node_modules
npm install
```

3. Atualize o Expo Go no seu dispositivo para a versão mais recente.

## 📚 Documentação

- [Expo SDK 51 Release Notes](https://expo.dev/changelog/2024/11-18-sdk-51/)
- [Upgrading Expo SDK](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/)

