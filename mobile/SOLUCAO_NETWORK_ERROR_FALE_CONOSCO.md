# 🔧 Solução: Network Error no Fale Conosco (Mobile)

## 🔍 Diagnóstico

O erro "Network Error" geralmente indica que o dispositivo não consegue acessar a URL da API.

## ✅ Verificações

### 1. Verificar URL da API

No console do app, você deve ver:
```
🔗 API_BASE_URL configurada: https://finflow-production-e4b3.up.railway.app
```

Se estiver diferente, verifique `mobile/src/config/api.js`.

### 2. Verificar Conectividade

- ✅ O dispositivo/emulador tem internet?
- ✅ Consegue acessar outros sites?
- ✅ Firewall não está bloqueando?

### 3. Verificar Logs

Quando tentar enviar, você verá nos logs:
```
📤 Enviando requisição para: https://finflow-production-e4b3.up.railway.app/api/fale-conosco
📤 API_BASE_URL: https://finflow-production-e4b3.up.railway.app
✅ Conexão com API OK: {...}
```

Se o teste de conexão falhar, o problema é de conectividade.

## 🔧 Soluções

### Solução 1: Verificar se está em APK ou Expo Go

**APK (Produção):**
- Deve usar: `https://finflow-production-e4b3.up.railway.app`
- Verifique se `__DEV__` está `false`

**Expo Go (Desenvolvimento):**
- Pode estar usando URL de produção (configurado em `api.js`)
- Verifique os logs no console

### Solução 2: Testar URL Manualmente

No navegador do dispositivo, tente acessar:
```
https://finflow-production-e4b3.up.railway.app/api/test
```

Se não abrir, o problema é de conectividade/firewall.

### Solução 3: Verificar Certificado SSL

Se aparecer erro de certificado:
- No Android, pode precisar aceitar certificado
- Verifique se a data/hora do dispositivo está correta

### Solução 4: Usar IP Direto (Temporário)

Se estiver em desenvolvimento local:

1. Descubra o IP da sua máquina:
   ```bash
   # Windows
   ipconfig
   
   # Linux/Mac
   ifconfig
   ```

2. No `mobile/src/config/api.js`, use:
   ```javascript
   return 'http://192.168.1.XXX:3001'; // Seu IP local
   ```

3. **IMPORTANTE**: Isso só funciona se o backend estiver rodando localmente

### Solução 5: Verificar Permissões Android

No `mobile/android/app/src/main/AndroidManifest.xml`, certifique-se de ter:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

## 🧪 Teste Rápido

1. Abra o app
2. Vá em "Fale Conosco"
3. Preencha o formulário
4. Envie a mensagem
5. Verifique os logs no console:
   - Se aparecer `✅ Conexão com API OK` → A conexão funciona
   - Se aparecer `⚠️ Teste de conexão falhou` → Problema de conectividade

## 📱 Testando em Dispositivo Físico

### Android:
1. Certifique-se de que o dispositivo tem internet
2. Tente acessar a URL no navegador do dispositivo
3. Se funcionar no navegador, deve funcionar no app

### iOS:
1. Certifique-se de que o dispositivo tem internet
2. Verifique se não há restrições de rede
3. Tente acessar a URL no Safari

## 🔍 Logs para Debug

Quando enviar, você verá:

```
📤 Enviando requisição para: https://...
📤 API_BASE_URL: https://...
📤 Dados: { nome: "...", email: "..." }
✅ Conexão com API OK: { message: "..." }
✅ Resposta da API: { status: "success", ... }
```

Ou, se houver erro:

```
❌ Erro ao enviar mensagem: [AxiosError: Network Error]
❌ Detalhes do erro: { message: "Network Error", ... }
```

## 💡 Dicas

1. **Sempre verifique os logs** - Eles mostram exatamente o que está acontecendo
2. **Teste a URL no navegador** - Se não abrir, o problema não é do app
3. **Verifique a internet** - Certifique-se de que o dispositivo tem conexão
4. **Em produção (APK)**, sempre use HTTPS
5. **Em desenvolvimento**, pode usar HTTP local se necessário

## 🆘 Se Nada Funcionar

1. Verifique se o backend está online:
   ```
   https://finflow-production-e4b3.up.railway.app/api/test
   ```

2. Verifique os logs do Railway para ver se a requisição chegou

3. Tente gerar um novo APK com as últimas alterações

4. Verifique se não há proxy/VPN bloqueando

