# 🚀 Instalação Completa da Evolution API

Este guia mostra como instalar a Evolution API do zero, incluindo a configuração da chave de autenticação.

## 📋 Passo a Passo Completo

### Passo 1: Escolher a Chave de Autenticação

**A chave é definida por VOCÊ!** Escolha uma chave segura:

**Exemplo de chave (use esta ou crie sua própria):**
```
WebCond_2025_Evolution_API_Chave_Secreta_123!@#
```

**Recomendações:**
- Mínimo 20 caracteres
- Letras maiúsculas e minúsculas
- Números
- Símbolos especiais

### Passo 2: Instalar Evolution API com Docker

**Execute este comando (pode ser de qualquer pasta):**

```bash
docker run -d \
  --name evolution-api \
  -p 8080:8080 \
  -e AUTHENTICATION_API_KEY=WebCond_2025_Evolution_API_Chave_Secreta_123!@# \
  atendai/evolution-api:latest
```

**⚠️ IMPORTANTE:** Substitua `WebCond_2025_Evolution_API_Chave_Secreta_123!@#` pela chave que você escolheu!

### Passo 3: Verificar se Está Rodando

```bash
# Verificar se o container está rodando
docker ps

# Ver logs (opcional)
docker logs evolution-api
```

### Passo 4: Acessar a Interface

Abra no navegador: `http://localhost:8080`

Você deve ver a interface da Evolution API.

### Passo 5: Configurar no Backend

Edite `backend/config.env` e use a **MESMA chave**:

```env
# Configurações da Evolution API (WhatsApp)
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_INSTANCE_NAME=webcond
EVOLUTION_API_KEY=WebCond_2025_Evolution_API_Chave_Secreta_123!@#
```

**⚠️ IMPORTANTE:** A chave aqui deve ser **EXATAMENTE IGUAL** à chave usada no Docker!

### Passo 6: Criar Instância do WhatsApp

1. Na interface da Evolution API (`http://localhost:8080`), crie uma instância chamada `webcond`
2. Escaneie o QR Code com seu WhatsApp
3. Aguarde a conexão

### Passo 7: Testar

```bash
cd backend
node scripts/testar-evolution-api.js
```

## 🔑 Usando a Chave que Já Está no config.env

**Método mais fácil:** Use a chave que já está configurada no seu `config.env`:

1. **Abra `backend/config.env`**
2. **Veja a linha:** `EVOLUTION_API_KEY=WebCond_2025_Evolution_API_Chave_Secreta_123!@#`
3. **Use essa chave no Docker:**

```bash
docker run -d \
  --name evolution-api \
  -p 8080:8080 \
  -e AUTHENTICATION_API_KEY=WebCond_2025_Evolution_API_Chave_Secreta_123!@# \
  atendai/evolution-api:latest
```

Assim, as chaves já estarão sincronizadas!

## ⚠️ Se a Chave Tiver Caracteres Especiais

Se sua chave tiver caracteres especiais que podem causar problemas no terminal:

**Windows PowerShell:**
```powershell
docker run -d `
  --name evolution-api `
  -p 8080:8080 `
  -e AUTHENTICATION_API_KEY="WebCond_2025_Evolution_API_Chave_Secreta_123!@#" `
  atendai/evolution-api:latest
```

**Windows CMD:**
```cmd
docker run -d ^
  --name evolution-api ^
  -p 8080:8080 ^
  -e AUTHENTICATION_API_KEY="WebCond_2025_Evolution_API_Chave_Secreta_123!@#" ^
  atendai/evolution-api:latest
```

**Linux/Mac:**
```bash
docker run -d \
  --name evolution-api \
  -p 8080:8080 \
  -e AUTHENTICATION_API_KEY="WebCond_2025_Evolution_API_Chave_Secreta_123!@#" \
  atendai/evolution-api:latest
```

## 🔍 Verificar Chave Configurada

Se você já instalou e quer verificar qual chave foi usada:

```bash
# Ver variáveis de ambiente do container
docker inspect evolution-api | findstr AUTHENTICATION_API_KEY
```

## ✅ Checklist Completo

- [ ] Escolhi uma chave segura
- [ ] Instalei Evolution API com `-e AUTHENTICATION_API_KEY=minha-chave`
- [ ] Container está rodando (`docker ps`)
- [ ] Interface acessível (`http://localhost:8080`)
- [ ] Configurei `EVOLUTION_API_KEY=minha-chave` no `config.env`
- [ ] As chaves são EXATAMENTE iguais
- [ ] Criei instância `webcond` na Evolution API
- [ ] Escaneei QR Code com WhatsApp
- [ ] Instância está conectada
- [ ] Testei: `node scripts/testar-evolution-api.js`

## 📚 Documentação Relacionada

- `COMO_OBTER_API_KEY_EVOLUTION.md` - Guia detalhado sobre a chave
- `COMO_CRIAR_INSTANCIA_WHATSAPP.md` - Como criar instância
- `TROUBLESHOOTING_WHATSAPP.md` - Resolução de problemas

