# ✅ Porta da Evolution API Corrigida

## 🎯 Problema Resolvido

A Evolution API está rodando na porta **8080**, mas o `config.env` estava configurado para **8082**.

## ✅ Correção Aplicada

O arquivo `backend/config.env` foi atualizado:

**Antes:**
```env
EVOLUTION_API_URL=http://localhost:8082
```

**Depois:**
```env
EVOLUTION_API_URL=http://localhost:8080
```

## 🔄 Próximos Passos

### 1. Reiniciar o Backend

**IMPORTANTE:** Você precisa reiniciar o backend para que a mudança tenha efeito.

1. **Pare o backend** (se estiver rodando):
   - Pressione `Ctrl+C` no terminal do backend

2. **Inicie novamente:**
   ```powershell
   cd D:\Negocios\Projetos\Web\projeto-web\backend
   npm start
   ```

### 2. Testar Conexão

Após reiniciar, teste a conexão:

```powershell
cd backend
node scripts/testar-evolution-api.js
```

**Deve mostrar:**
- ✅ Evolution API acessível
- ✅ Instância `finflow` encontrada
- ✅ Status: `open` ou `connected`

### 3. Testar Envio de WhatsApp

Após confirmar que está conectado, teste o envio:

```powershell
curl -X POST http://localhost:3001/api/lembretes/teste-whatsapp -H "Content-Type: application/json" -d "{\"userId\": 1}"
```

Substitua `userId: 1` pelo ID do seu usuário.

## 📋 Configuração Final

Seu `config.env` agora está assim:

```env
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_INSTANCE_NAME=finflow
EVOLUTION_API_KEY=WebCond_2025_Evolution_API_Chave_Secreta_123!@#
```

## ✅ Checklist

- [x] Evolution API rodando na porta 8080
- [x] Instância `finflow` criada
- [x] `config.env` atualizado para porta 8080
- [ ] Backend reiniciado
- [ ] Teste de conexão executado
- [ ] Teste de envio executado

## 💡 Nota

Se você mudar a porta da Evolution API no futuro, lembre-se de atualizar o `config.env` e reiniciar o backend!

