# 📱 Instruções para Adicionar Coluna WhatsApp no Banco de Dados

## 🎯 Problema

Ao tentar salvar as configurações de perfil ou habilitar o WhatsApp no app, aparece um erro porque a coluna `Usuario_LembretesWhatsApp` não existe no banco de dados de produção.

## ✅ Solução

Execute o script `adicionar-coluna-whatsapp.js` no banco de dados de produção.

### 📋 Passo a Passo

#### Opção 1: Usando arquivo de configuração de produção (Recomendado)

1. **Crie o arquivo de configuração de produção:**
   ```bash
   cd backend
   cp config.production.env.example config.production.env
   ```

2. **Edite o arquivo `config.production.env` com as credenciais do banco de produção:**
   ```env
   DB_HOST=seu-host-producao.com
   DB_PORT=5432
   DB_NAME=nome-do-banco-producao
   DB_USER=usuario-producao
   DB_PASSWORD=sua-senha-producao
   ```

3. **Execute o script com a flag `--production`:**
   ```bash
   node scripts/adicionar-coluna-whatsapp.js --production
   ```

   **OU usando variável de ambiente:**
   ```bash
   CONFIG_FILE=config.production.env node scripts/adicionar-coluna-whatsapp.js
   ```

#### Opção 2: Usando config.env padrão

1. **Certifique-se de que o arquivo `config.env` está configurado com as credenciais do banco de produção:**
   - Verifique se `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` estão corretos

2. **Execute o script:**
   ```bash
   node scripts/adicionar-coluna-whatsapp.js
   ```

5. **Verifique a saída:**
   - Se a coluna já existir, você verá: `✅ Coluna Usuario_LembretesWhatsApp já existe!`
   - Se a coluna for criada, você verá: `✅ Coluna Usuario_LembretesWhatsApp adicionada com sucesso!`

### 🔍 Verificação Manual (Opcional)

Se quiser verificar manualmente se a coluna foi criada, você pode executar no banco de dados:

```sql
-- Verificar se a coluna existe (maiúsculas)
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'Usuario' 
AND column_name = 'Usuario_LembretesWhatsApp';

-- OU (minúsculas)
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'usuario' 
AND column_name = 'usuario_lembreteswhatsapp';
```

### ⚠️ Importante

- O script é **idempotente** - pode ser executado múltiplas vezes sem problemas
- Se a coluna já existir, o script apenas informa e não tenta criar novamente
- O script tenta criar a coluna tanto com maiúsculas quanto minúsculas, dependendo da estrutura do seu banco
- **NÃO commite o arquivo `config.production.env`** com dados reais! Use apenas o `.example` no repositório
- O arquivo `config.production.env` deve estar no `.gitignore` para não expor credenciais

### 🚀 Após Executar o Script

1. Reinicie o backend (se necessário)
2. Teste novamente no app:
   - Tente salvar as informações de perfil
   - Tente habilitar o WhatsApp nas configurações de lembretes

### 📝 Nota

O código do backend foi atualizado para verificar se a coluna existe antes de tentar atualizá-la. Se a coluna não existir, o sistema continuará funcionando normalmente, apenas ignorando a atualização do campo WhatsApp.

