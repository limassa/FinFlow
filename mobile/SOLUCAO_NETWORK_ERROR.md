# 🔧 Solução: Network Error no Login

## ❌ Problema

Ao tentar fazer login, você recebe:
```
ERROR Erro no login: [AxiosError: Network Error]
```

## ✅ Solução Rápida

### Passo 1: Descubra o IP da sua máquina

**Windows (PowerShell):**
```powershell
.\descobrir-ip.ps1
```

**Ou manualmente:**
```powershell
ipconfig
```
Procure por "IPv4 Address" (ex: 192.168.1.100)

**Linux/Mac:**
```bash
./descobrir-ip.sh
```

### Passo 2: Configure o IP no app

1. Abra: `mobile/src/config/api.js`

2. Encontre esta linha (por volta da linha 20):
   ```javascript
   // return 'http://192.168.1.100:3001';
   ```

3. Descomente e substitua pelo SEU IP:
   ```javascript
   return 'http://192.168.1.100:3001'; // Use SEU IP aqui
   ```

4. Salve o arquivo

### Passo 3: Reinicie o app

```bash
# Pare o app (Ctrl+C) e reinicie
npm start
```

## ✅ Verificações

Antes de testar, certifique-se de que:

1. ✅ **Backend está rodando:**
   ```bash
   # No terminal do backend, você deve ver:
   🚀 Servidor rodando na porta 3001
   ```

2. ✅ **Mesma rede Wi-Fi:**
   - Seu computador e dispositivo móvel devem estar na mesma rede

3. ✅ **Firewall não bloqueia:**
   - Windows pode bloquear a porta 3001
   - Permita conexões na porta 3001

4. ✅ **IP correto:**
   - Use o IP da sua máquina, não `localhost`
   - O IP deve ser algo como `192.168.x.x` ou `10.0.x.x`

## 🔍 Como Testar a Conexão

**No terminal:**
```bash
# Teste se o backend responde
curl http://SEU_IP:3001/health
```

**No app:**
- Verifique os logs do console
- Procure por: `🔗 API_BASE_URL configurada:`
- Deve mostrar o IP que você configurou

## 📱 Para Diferentes Ambientes

### Emulador Android
```javascript
return 'http://10.0.2.2:3001';
```

### Simulador iOS
```javascript
return 'http://localhost:3001';
```

### Dispositivo Físico
```javascript
return 'http://192.168.1.100:3001'; // Seu IP
```

## 🚨 Se Ainda Não Funcionar

1. **Verifique o backend:**
   - Está rodando?
   - Está na porta 3001?
   - Teste: `http://localhost:3001/health`

2. **Verifique a rede:**
   - Mesma Wi-Fi?
   - Firewall bloqueando?

3. **Verifique o IP:**
   - Execute `ipconfig` novamente
   - O IP mudou? (IPs podem mudar)

4. **Limpe o cache:**
   ```bash
   npm run start:clear
   ```

## 📚 Mais Informações

Veja `CONFIGURAR_API.md` para detalhes completos.

