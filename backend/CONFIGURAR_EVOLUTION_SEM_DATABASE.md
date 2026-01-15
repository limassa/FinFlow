# ✅ Configurar Evolution API Sem Database

## 🎯 Problema

Ao iniciar a Evolution API, você recebe:
```
Error: Database provider mongodb invalid.
```

## ✅ Solução: Desabilitar Database

Para desenvolvimento e testes, você pode usar a Evolution API **sem database**.

### Passo 1: Localizar Arquivo .env

O arquivo `.env` deve estar na raiz do projeto `evolution-api`:

```
D:\Negocios\Projetos\evolution-api\.env
```

### Passo 2: Editar .env

Abra o arquivo `.env` e configure assim:

```env
# Autenticação
AUTHENTICATION_API_KEY=WebCond_2025_Evolution_API_Chave_Secreta_123!@#

# Servidor
SERVER_URL=http://localhost:8082
PORT=8082

# Database - DESABILITAR
DATABASE_ENABLED=false

# Ou se não funcionar, comente todas as linhas de database:
# DATABASE_ENABLED=false
# DATABASE_PROVIDER=
# DATABASE_CONNECTION_URI=
```

### Passo 3: Remover Linhas de Database

Se ainda der erro, **remova ou comente** todas as linhas relacionadas a database:

```env
# Database - COMENTADO/DESABILITADO
# DATABASE_ENABLED=true
# DATABASE_PROVIDER=mongodb
# DATABASE_CONNECTION_URI=mongodb://...
```

### Passo 4: Reiniciar

1. **Pare a Evolution API** (Ctrl+C no terminal)
2. **Inicie novamente:**
   ```powershell
   cd D:\Negocios\Projetos\evolution-api
   npm start
   ```

## 🔍 Verificar Configuração

Se o arquivo `.env` não existir, crie um:

```powershell
cd D:\Negocios\Projetos\evolution-api
copy .env.example .env
# Depois edite o .env conforme acima
```

## 📋 Configuração Mínima Recomendada

Arquivo `.env` mínimo que deve funcionar:

```env
AUTHENTICATION_API_KEY=WebCond_2025_Evolution_API_Chave_Secreta_123!@#
SERVER_URL=http://localhost:8082
PORT=8082
DATABASE_ENABLED=false
```

## ⚠️ Se Ainda Der Erro

### Opção 1: Verificar se há .env.example

```powershell
cd D:\Negocios\Projetos\evolution-api
Get-Content .env.example
```

Copie apenas as linhas necessárias e configure `DATABASE_ENABLED=false`.

### Opção 2: Criar .env do Zero

Crie um arquivo `.env` novo com apenas:

```env
AUTHENTICATION_API_KEY=WebCond_2025_Evolution_API_Chave_Secreta_123!@#
SERVER_URL=http://localhost:8082
PORT=8082
DATABASE_ENABLED=false
NODE_ENV=development
```

### Opção 3: Verificar Código Fonte

Se o erro persistir, pode ser que a versão do código não permita desabilitar database. Nesse caso:

1. **Verifique a versão:**
   ```powershell
   cd D:\Negocios\Projetos\evolution-api
   Get-Content package.json | Select-String "version"
   ```

2. **Tente atualizar:**
   ```powershell
   git pull
   npm install
   ```

## ✅ Após Configurar

1. **Inicie a Evolution API:**
   ```powershell
   npm start
   ```

2. **Aguarde a mensagem de sucesso:**
   ```
   Server is up and running
   ```

3. **Acesse:**
   ```
   http://localhost:8082
   ```

4. **Crie a instância `webcond`**
5. **Escaneie o QR Code**

## 💡 Nota

Sem database, os dados são armazenados em memória/arquivos locais. Isso é perfeito para desenvolvimento, mas para produção você precisará configurar um database adequado.

