# 🚀 Scripts para Iniciar o Expo Go

Este diretório contém scripts para facilitar o início do Expo Go em diferentes sistemas operacionais.

## 📋 Scripts Disponíveis

### 1. PowerShell (Windows) - `start-expo.ps1`
```powershell
.\start-expo.ps1
```

### 2. Bash (Linux/Mac) - `start-expo.sh`
```bash
./start-expo.sh
```

### 3. Batch (Windows) - `start-expo.bat`
```cmd
start-expo.bat
```

### 4. NPM Scripts (Todos os sistemas)

Adicionei scripts úteis no `package.json`:

```bash
# Iniciar normalmente
npm start

# Iniciar limpando o cache
npm run start:clear

# Iniciar com tunnel (para testes remotos)
npm run start:tunnel
# ou
npm run expo:go

# Iniciar com LAN (mesma rede)
npm run start:lan
# ou
npm run expo:local

# Iniciar com cache limpo
npm run expo:dev

# Iniciar no Android
npm run android

# Iniciar no iOS
npm run ios

# Iniciar no navegador
npm run web
```

## 🎯 Modos de Conexão

### 1. Tunnel (Recomendado para testes remotos)
- Funciona mesmo se o dispositivo não estiver na mesma rede
- Mais lento, mas mais flexível
- Requer conta Expo (gratuita)

```bash
npm run expo:go
# ou
npx expo start --tunnel
```

### 2. LAN (Recomendado para testes locais)
- Dispositivo precisa estar na mesma rede Wi-Fi
- Mais rápido que tunnel
- Use o IP da sua máquina na configuração da API

```bash
npm run expo:local
# ou
npx expo start --lan
```

### 3. Local (Apenas localhost)
- Apenas para emuladores
- Não funciona com dispositivos físicos

```bash
npm start
# ou
npx expo start
```

## 📱 Como Usar

### Windows (PowerShell)
1. Abra o PowerShell na pasta `mobile`
2. Execute: `.\start-expo.ps1`
3. Escolha o modo de conexão
4. Escaneie o QR code com o Expo Go

### Windows (CMD)
1. Abra o CMD na pasta `mobile`
2. Execute: `start-expo.bat`
3. Escolha o modo de conexão
4. Escaneie o QR code com o Expo Go

### Linux/Mac
1. Abra o terminal na pasta `mobile`
2. Execute: `./start-expo.sh`
3. Escolha o modo de conexão
4. Escaneie o QR code com o Expo Go

## 🔧 Configuração da API para Dispositivos Físicos

**IMPORTANTE**: Se você estiver testando em um dispositivo físico, precisa configurar o IP da sua máquina na rede local.

1. Descubra o IP da sua máquina:
   - **Windows**: `ipconfig` (procure por IPv4)
   - **Linux/Mac**: `ifconfig` ou `ip addr`

2. Edite `src/config/api.js`:
```javascript
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.100:3001'  // Use o IP da sua máquina
  : 'https://sua-api-producao.com';
```

3. Certifique-se de que o backend está rodando na porta 3001

## ⌨️ Atalhos do Expo

Quando o Expo estiver rodando, você pode usar:

- **`a`** - Abrir no Android emulador
- **`i`** - Abrir no iOS emulador (apenas Mac)
- **`w`** - Abrir no navegador web
- **`r`** - Recarregar o app
- **`m`** - Abrir menu de desenvolvedor
- **`j`** - Abrir debugger
- **`Ctrl+C`** - Parar o servidor

## 🐛 Solução de Problemas

### Erro: "Cannot find module"
```bash
npm install
```

### Erro: "Port already in use"
```bash
# Limpe o cache e reinicie
npm run start:clear
```

### App não conecta ao backend
1. Verifique se o backend está rodando
2. Verifique o IP na configuração da API
3. Verifique se o firewall não está bloqueando a porta 3001

### QR Code não aparece
1. Tente usar o modo tunnel: `npm run expo:go`
2. Verifique sua conexão com a internet
3. Tente limpar o cache: `npm run start:clear`

## 📚 Mais Informações

- [Documentação do Expo](https://docs.expo.dev/)
- [Expo CLI Reference](https://docs.expo.dev/workflow/expo-cli/)
- [Troubleshooting Expo](https://docs.expo.dev/troubleshooting/clear-cache/)

