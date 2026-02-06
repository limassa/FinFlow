# 🔑 Encontrar a API Key Correta

## 🎯 Problema

Erro 401 (Unauthorized) indica que a API Key está incorreta.

## ✅ Solução: Verificar API Key na Evolution API

### Passo 1: Abrir Arquivo .env da Evolution API

O arquivo está em:
```
D:\Negocios\Projetos\Web\projeto-web\services\evolution-api\.env
```

### Passo 2: Encontrar a API Key

Procure pela linha:
```env
AUTHENTICATION_API_KEY=...
```

**Copie o valor** (sem aspas, se houver).

### Passo 3: Atualizar config.env do Backend

1. **Abra:**
   ```
   D:\Negocios\Projetos\Web\projeto-web\backend\config.env
   ```

2. **Atualize a linha:**
   ```env
   EVOLUTION_API_KEY=valor-copiado-do-passo-2
   ```

3. **Salve o arquivo**

### Passo 4: Reiniciar Backend

**IMPORTANTE:** Reinicie o backend:

```powershell
# Pare o backend (Ctrl+C)
# Depois inicie novamente:
cd D:\Negocios\Projetos\Web\projeto-web\backend
npm start
```

### Passo 5: Testar

```powershell
cd backend
node scripts/testar-evolution-api.js
```

## 🔍 Se Não Encontrar o Arquivo .env

### Opção 1: Verificar se Existe

```powershell
Test-Path "D:\Negocios\Projetos\Web\projeto-web\services\evolution-api\.env"
```

### Opção 2: Criar do env.example

Se não existir, copie do exemplo:

```powershell
cd D:\Negocios\Projetos\Web\projeto-web\services\evolution-api
copy env.example .env
```

Depois edite o `.env` e configure a `AUTHENTICATION_API_KEY`.

### Opção 3: Verificar na Interface Web

Algumas versões da Evolution API mostram a API Key na interface web em `http://localhost:8080`.

## ⚠️ Importante

- ✅ A API Key deve ser **EXATAMENTE IGUAL** em ambos os arquivos
- ✅ Sem espaços extras
- ✅ Sem aspas (se houver, remova)
- ✅ Case-sensitive

## 🧪 Teste Rápido

Após atualizar, teste:

```powershell
cd backend
node scripts/testar-evolution-api.js
```

**Deve mostrar:**
- ✅ Evolution API acessível
- ✅ Instância `finflow` encontrada
- ✅ Status: `open` ou `connected`

## 💡 Dica

Se você não configurou uma API Key na Evolution API, pode ser que ela não esteja exigindo autenticação. Nesse caso:

1. **Deixe vazio no `config.env`:**
   ```env
   EVOLUTION_API_KEY=
   ```

2. **Ou remova a linha**

3. **O código já trata isso** - não enviará o header se estiver vazio

