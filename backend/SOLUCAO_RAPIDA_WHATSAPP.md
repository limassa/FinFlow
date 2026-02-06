# ⚡ Solução Rápida - Erro 401 WhatsApp

## ❌ Erro: 401 (Unauthorized)

O erro 401 significa que a **API Key está incorreta** ou o **formato do header está errado**.

## 🔧 Solução Rápida (3 opções)

### Opção 1: Desabilitar Autenticação (Mais Rápido)

Se a Evolution API **não requer autenticação**:

1. **Edite `backend/config.env`:**
   ```env
   EVOLUTION_API_KEY=
   ```
   (Deixe vazio)

2. **Reinicie o backend**

3. **Teste novamente**

### Opção 2: Verificar e Corrigir a API Key

Se a Evolution API **requer autenticação**:

1. **Acesse a Evolution API:**
   - Abra no navegador: `http://localhost:8080`
   - Veja qual API Key está configurada na Evolution API

2. **Compare com `config.env`:**
   - Abra `backend/config.env`
   - Verifique a linha: `EVOLUTION_API_KEY=...`
   - A API Key deve ser **exatamente igual** à configurada na Evolution API

3. **Se estiver diferente, atualize:**
   ```env
   EVOLUTION_API_KEY=sua-api-key-correta-aqui
   ```

4. **Reinicie o backend**

### Opção 3: Testar Diferentes Formatos

Execute o teste avançado:

```bash
cd backend
node scripts/testar-evolution-api-avancado.js
```

Este script testa diferentes formatos de header e mostra qual funciona.

## 📋 Checklist Rápido

- [ ] Evolution API está rodando? (`http://localhost:8080` acessível)
- [ ] API Key está correta? (Comparar com Evolution API)
- [ ] Backend foi reiniciado após alterar `config.env`?
- [ ] Instância está criada e conectada? (QR Code escaneado)

## 🚀 Testar Agora

1. **Execute o teste avançado:**
   ```bash
   cd backend
   node scripts/testar-evolution-api-avancado.js
   ```

2. **Siga a recomendação do teste**

3. **Reinicie o backend**

4. **Teste novamente a rota de WhatsApp**

## 💡 Dica

Se você **não configurou uma API Key** na Evolution API, **deixe `EVOLUTION_API_KEY` vazio** no `config.env`.

