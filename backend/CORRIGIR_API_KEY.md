# 🔑 Corrigir API Key - Erro 401 Unauthorized

## 🎯 Problema

Ao testar a conexão, você recebe:
```
Status HTTP: 401
Resposta: {"status":401,"error":"Unauthorized","response":{"message":"Unauthorized"}}
```

Isso significa que a **API Key está incorreta** ou não está sendo enviada corretamente.

## ✅ Solução

### Passo 1: Verificar API Key na Evolution API

1. **Abra o arquivo:**
   ```
   D:\Negocios\Projetos\Web\projeto-web\services\evolution-api\.env
   ```

2. **Encontre a linha:**
   ```env
   AUTHENTICATION_API_KEY=...
   ```

3. **Copie o valor** (sem aspas)

### Passo 2: Atualizar config.env

1. **Abra o arquivo:**
   ```
   D:\Negocios\Projetos\Web\projeto-web\backend\config.env
   ```

2. **Atualize a linha:**
   ```env
   EVOLUTION_API_KEY=valor-copiado-do-passo-1
   ```

3. **Salve o arquivo**

### Passo 3: Reiniciar Backend

**IMPORTANTE:** Reinicie o backend para aplicar a mudança:

1. **Pare o backend** (Ctrl+C)
2. **Inicie novamente:**
   ```powershell
   cd D:\Negocios\Projetos\Web\projeto-web\backend
   npm start
   ```

### Passo 4: Testar Novamente

```powershell
cd backend
node scripts/testar-evolution-api.js
```

**Deve mostrar:**
- ✅ Evolution API acessível
- ✅ Instância `finflow` encontrada
- ✅ Status: `open` ou `connected`

## 🔍 Se Não Souber a API Key

### Opção 1: Verificar no .env da Evolution API

O arquivo está em:
```
services/evolution-api/.env
```

Procure por `AUTHENTICATION_API_KEY`.

### Opção 2: Verificar na Interface Web

1. Acesse: `http://localhost:8080`
2. Procure por configurações de API Key
3. Ou verifique a documentação da Evolution API

### Opção 3: Se Não Tiver API Key Configurada

Se a Evolution API não tiver API Key configurada (autenticação desabilitada):

1. **No `config.env` do backend, deixe vazio:**
   ```env
   EVOLUTION_API_KEY=
   ```

2. **Ou remova a linha**

3. **Atualize o `whatsappService.js`** para não enviar o header se a key estiver vazia (já está assim)

## 📋 Formato do Header

A Evolution API espera o header no formato:
```
apikey: sua-chave-aqui
```

O código já está configurado corretamente para isso.

## ⚠️ Importante

- ✅ A API Key no `backend/config.env` deve ser **EXATAMENTE IGUAL** à do `services/evolution-api/.env`
- ✅ Sem espaços extras
- ✅ Sem aspas (se houver no .env, remova ao copiar)
- ✅ Case-sensitive (maiúsculas/minúsculas importam)

## 🧪 Teste Rápido

Após atualizar, teste:

```powershell
cd backend
node scripts/testar-evolution-api.js
```

Se ainda der 401, a API Key ainda está incorreta.

