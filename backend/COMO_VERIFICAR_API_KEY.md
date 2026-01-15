# 🔑 Como Verificar e Corrigir a API Key da Evolution API

## 🎯 Problema

Erro 401 (Unauthorized) ao tentar conectar com a Evolution API.

## 🔍 Verificar a API Key

### Método 1: Via Interface da Evolution API

1. **Acesse a interface:**
   ```
   http://localhost:8080
   ```

2. **Procure por configurações de autenticação:**
   - Geralmente está em "Settings" ou "Configurações"
   - Ou no arquivo `.env` da Evolution API

3. **Anote a API Key configurada**

### Método 2: Via Arquivo .env da Evolution API

1. **Localize o arquivo `.env` da Evolution API:**
   - Geralmente em: `services/evolution-api/.env`
   - Ou onde você instalou a Evolution API

2. **Procure pela linha:**
   ```env
   AUTHENTICATION_API_KEY=sua-chave-aqui
   ```

3. **Copie o valor exato**

### Método 3: Via Script de Teste

Execute o script de teste que mostra a API Key carregada:

```bash
cd backend
node scripts/testar-evolution-api.js
```

O script mostrará:
- Se a API Key foi carregada do `config.env`
- O tamanho da API Key
- Os primeiros e últimos caracteres

## ✅ Corrigir a API Key

### 1. Atualizar o config.env

Abra o arquivo `backend/config.env` e atualize a linha:

```env
EVOLUTION_API_KEY=sua-chave-correta-aqui
```

**⚠️ IMPORTANTE:**
- A API Key deve ser **EXATAMENTE** igual à configurada na Evolution API
- Sem espaços antes ou depois
- Sem aspas

### 2. Reiniciar o Backend

Após atualizar o `config.env`:

```bash
# Pare o backend (Ctrl+C)
# Depois inicie novamente:
cd backend
npm start
```

### 3. Testar Novamente

```bash
cd backend
node scripts/testar-evolution-api.js
```

## 🔧 Formato do Header

A Evolution API pode usar diferentes formatos de header. O código atual usa:

```javascript
headers['apikey'] = EVOLUTION_API_KEY;
```

Se ainda der erro 401, tente outros formatos editando `backend/src/services/whatsappService.js`:

**Opção 1 (atual):**
```javascript
headers['apikey'] = this.apiKey;
```

**Opção 2:**
```javascript
headers['Authorization'] = `Bearer ${this.apiKey}`;
```

**Opção 3:**
```javascript
headers['x-api-key'] = this.apiKey;
```

## 📋 Checklist

- [ ] Evolution API está rodando (`http://localhost:8080`)
- [ ] API Key encontrada na Evolution API
- [ ] API Key copiada corretamente (sem espaços)
- [ ] `config.env` atualizado com a API Key correta
- [ ] Backend reiniciado após atualizar `config.env`
- [ ] Script de teste executado novamente

## 💡 Dica

Se você não encontrar a API Key na Evolution API, ela pode estar configurada de forma diferente. Verifique:

1. **Arquivo de configuração da Evolution API**
2. **Variáveis de ambiente do Docker** (se estiver usando Docker)
3. **Interface web da Evolution API** (geralmente em Settings)

## 🆘 Se Nada Funcionar

1. **Desabilite a autenticação temporariamente** (apenas para teste):
   - Na Evolution API, configure para não exigir API Key
   - Ou deixe o campo vazio no `config.env`

2. **Verifique a documentação da Evolution API:**
   - Versão específica que você está usando
   - Formato de autenticação esperado

3. **Teste sem API Key primeiro:**
   - Remova a linha `EVOLUTION_API_KEY` do `config.env`
   - Teste se a API responde sem autenticação
   - Se funcionar, o problema é apenas a API Key

