# 🔧 Solução do Erro: Cannot find module '@react-native/metro-config'

## Problema

O Expo estava tentando usar o `metro.config.js` da raiz do projeto ao invés de um específico para o mobile, causando o erro:
```
Error: Cannot find module '@react-native/metro-config'
```

## Solução Aplicada

1. **Criado `metro.config.js` específico para o mobile** (`mobile/metro.config.js`)
   - Usa a configuração padrão do Expo
   - Não depende de `@react-native/metro-config`

2. **Renomeado `metro.config.js` da raiz** para `metro.config.js.web`
   - Evita conflito com o Expo
   - Mantém a configuração do projeto web React

3. **O arquivo criado usa a configuração do Expo:**
```javascript
const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
module.exports = config;
```

## Como Verificar

Execute:
```bash
cd mobile
npm start
```

O Expo agora deve usar o `metro.config.js` da pasta `mobile` ao invés do da raiz.

## Nota

O `metro.config.js` na raiz do projeto é para o projeto web React. O Expo precisa de sua própria configuração do Metro, que foi criada na pasta `mobile`.

## Se o Erro Persistir

1. Limpe o cache:
```bash
cd mobile
npm run start:clear
```

2. Delete `node_modules` e reinstale:
```bash
cd mobile
rm -rf node_modules  # Linux/Mac
# ou
Remove-Item -Recurse -Force node_modules  # Windows PowerShell
npm install
```

3. Verifique se está na pasta correta:
```bash
# Certifique-se de estar em mobile/
cd mobile
npm start
```

4. Se ainda houver problemas, verifique se o `metro.config.js` da raiz foi renomeado:
```bash
# Na raiz do projeto, renomeie manualmente se necessário:
# metro.config.js -> metro.config.js.web
```
