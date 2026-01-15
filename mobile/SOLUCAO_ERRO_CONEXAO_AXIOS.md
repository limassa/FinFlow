# 🔧 Solução: Erro de Conexão Axios no App

## ❌ Problema

Ao abrir o app, você recebe erro de conexão axios:
- `Network Error`
- `ERR_NETWORK`
- `Connection refused`

## ✅ Solução Rápida

### Passo 1: Descobrir o IP Atual

**Windows (PowerShell):**
```powershell
# Execute o script:
.\mobile\descobrir-ip.ps1

# Ou manualmente:
ipconfig
```
Procure por "IPv4 Address" (ex: `192.168.1.100`)

**Linux/Mac:**
```bash
ifconfig
# ou
ip addr
```

### Passo 2: Atualizar Configuração do App

1. **Abra:** `mobile/src/config/api.js`

2. **Encontre a linha 20:**
   ```javascript
   return 'http://192.168.1.7:3001';
   ```

3. **Substitua pelo SEU IP atual:**
   ```javascript
   return 'http://192.168.1.100:3001'; // Use SEU IP aqui
   ```

4. **Salve o arquivo**

### Passo 3: Verificar Backend

Certifique-se de que o backend está rodando:

```powershell
cd backend
npm start
```

**Deve mostrar:**
```
🚀 Servidor rodando na porta 3001
```

### Passo 4: Testar Conexão

**No terminal:**
```powershell
# Teste se o backend responde no seu IP
curl http://SEU_IP:3001/health
```

**Deve retornar:** Status 200 ou JSON com status

### Passo 5: Reiniciar o App

1. **Pare o app** (Ctrl+C no terminal do Expo)
2. **Limpe o cache:**
   ```bash
   cd mobile
   npx expo start -c
   ```
3. **Escaneie o QR Code novamente**

## 🔍 Verificações Importantes

### ✅ Mesma Rede Wi-Fi

- Seu computador e dispositivo móvel devem estar na **mesma rede Wi-Fi**
- Não use dados móveis

### ✅ Firewall

O Windows pode estar bloqueando a porta 3001:

1. **Abra o Firewall do Windows**
2. **Permita conexões na porta 3001**
3. **Ou desative temporariamente o firewall para testar**

### ✅ Backend Rodando

Verifique se o backend está realmente rodando:
- Terminal do backend deve mostrar: `🚀 Servidor rodando na porta 3001`
- Teste: `curl http://localhost:3001/health`

### ✅ IP Correto

- Use o IP da sua máquina, **não** `localhost`
- O IP deve ser algo como `192.168.x.x` ou `10.0.x.x`
- O IP pode mudar se você reconectar na rede Wi-Fi

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

## 🧪 Teste de Diagnóstico

Execute este teste para verificar tudo:

```powershell
# 1. Verificar IP
ipconfig

# 2. Verificar se backend está rodando
curl http://localhost:3001/health

# 3. Verificar se backend responde no IP
curl http://SEU_IP:3001/health

# 4. Verificar logs do backend ao tentar conectar
# (veja o terminal do backend)
```

## 🚨 Se Ainda Não Funcionar

1. **Verifique os logs do app:**
   - No terminal do Expo, veja os logs
   - Procure por: `🔗 API_BASE_URL configurada:`
   - Confirme que está usando o IP correto

2. **Verifique os logs do backend:**
   - Veja se há requisições chegando
   - Se não houver, o problema é de rede/firewall

3. **Teste com outro dispositivo:**
   - Tente com emulador primeiro
   - Se funcionar no emulador, o problema é rede/firewall

4. **Verifique CORS:**
   - O backend deve permitir requisições do app
   - Verifique `backend/app.js` para configuração de CORS

## 💡 Dica: IP Dinâmico

Se seu IP muda frequentemente, considere:

1. **Configurar IP estático** no roteador
2. **Usar variável de ambiente** no app
3. **Criar script** para atualizar automaticamente

## 📋 Checklist

- [ ] IP atual descoberto
- [ ] `mobile/src/config/api.js` atualizado com IP correto
- [ ] Backend rodando na porta 3001
- [ ] Mesma rede Wi-Fi
- [ ] Firewall permitindo porta 3001
- [ ] App reiniciado com cache limpo
- [ ] Teste de conexão bem-sucedido

