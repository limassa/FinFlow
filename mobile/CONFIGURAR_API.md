# 🔧 Como Configurar a API para o App Mobile

## ❌ Problema: Network Error

Se você está recebendo `Network Error` ao fazer login, é porque o app está tentando conectar em `localhost:3001`, que **não funciona em dispositivos físicos**.

## ✅ Soluções

### Opção 1: Configurar IP Manualmente (Recomendado)

1. **Descubra o IP da sua máquina:**

   **Windows:**
   ```powershell
   ipconfig
   ```
   Procure por "IPv4 Address" (ex: 192.168.1.100)

   **Linux/Mac:**
   ```bash
   ifconfig
   # ou
   ip addr
   ```

2. **Edite `mobile/src/config/api.js`:**

   Encontre esta linha:
   ```javascript
   // return 'http://192.168.1.100:3001';
   ```

   Descomente e substitua pelo seu IP:
   ```javascript
   return 'http://192.168.1.100:3001'; // Use SEU IP aqui
   ```

3. **Certifique-se de que:**
   - O backend está rodando na porta 3001
   - Seu dispositivo e computador estão na mesma rede Wi-Fi
   - O firewall não está bloqueando a porta 3001

### Opção 2: Usar Variável de Ambiente

1. **Crie um arquivo `.env` na pasta `mobile/`:**
   ```
   EXPO_PUBLIC_API_URL=http://192.168.1.100:3001
   ```

2. **Instale o pacote para variáveis de ambiente:**
   ```bash
   npm install dotenv
   ```

3. **O app usará automaticamente a variável de ambiente**

### Opção 3: Para Emuladores

**Android Emulador:**
```javascript
return 'http://10.0.2.2:3001';
```

**iOS Simulador:**
```javascript
return 'http://localhost:3001';
```

## 🔍 Como Testar

1. **Verifique se o backend está rodando:**
   ```bash
   # No terminal, teste:
   curl http://localhost:3001/health
   # ou
   curl http://SEU_IP:3001/health
   ```

2. **No app, verifique os logs:**
   - Procure por: `🔗 API_BASE_URL configurada:`
   - Confirme que está usando o IP correto

3. **Teste a conexão:**
   - Tente fazer login
   - Se ainda der erro, verifique o console do backend

## 🚨 Troubleshooting

### Erro: "Network Error"
- ✅ Verifique se o IP está correto
- ✅ Verifique se o backend está rodando
- ✅ Verifique se estão na mesma rede Wi-Fi
- ✅ Verifique o firewall do Windows

### Erro: "Connection refused"
- ✅ Verifique se o backend está na porta 3001
- ✅ Verifique se o IP está correto

### Funciona no emulador mas não no dispositivo físico
- ✅ Use o IP da máquina, não localhost
- ✅ Certifique-se de que estão na mesma rede

## 📝 Exemplo de Configuração

```javascript
// mobile/src/config/api.js

const getApiUrl = () => {
  if (__DEV__) {
    // Para dispositivo físico - SUBSTITUA PELO SEU IP
    return 'http://192.168.1.100:3001';
    
    // Para Android emulador
    // return 'http://10.0.2.2:3001';
    
    // Para iOS simulador
    // return 'http://localhost:3001';
  }
  
  // Produção
  return 'https://seu-backend-producao.com';
};
```

## 🔐 Para Produção

Quando for fazer deploy, configure a URL de produção:

```javascript
return 'https://finflow-backend-production.up.railway.app';
// ou sua URL de produção
```

