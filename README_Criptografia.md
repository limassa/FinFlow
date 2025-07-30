# 🔐 Criptografia de Senhas - FinFlow

## 📋 Visão Geral

Implementamos criptografia de senhas usando **bcrypt** para garantir a segurança dos dados dos usuários no banco de dados.

## 🛠️ Implementação

### **Tecnologia Utilizada:**
- **bcrypt**: Biblioteca para criptografia de senhas
- **Salt Rounds**: 10 (padrão recomendado)
- **Compatibilidade**: Suporte a senhas antigas (não criptografadas)

### **Funcionalidades:**

#### **1. Criação de Usuários**
- ✅ Senhas são criptografadas automaticamente
- ✅ Salt único para cada senha
- ✅ Hash seguro com bcrypt

#### **2. Login de Usuários**
- ✅ Verificação de senhas criptografadas
- ✅ Suporte a senhas antigas (migração automática)
- ✅ Retorno de usuário sem senha

#### **3. Migração de Senhas Antigas**
- ✅ Função para migrar senhas existentes
- ✅ Detecção automática de senhas não criptografadas
- ✅ Processo seguro e reversível

## 🚀 Como Usar

### **1. Preparar o Banco de Dados**
```sql
-- Executar o script SQL_Criptografia.sql
-- Isso garante que a coluna Usuario_Senha tenha tamanho adequado
```

### **2. Migrar Senhas Existentes (Opcional)**
```bash
# Fazer uma requisição POST para migrar senhas antigas
curl -X POST http://localhost:3001/api/migrate-passwords
```

### **3. Testar o Sistema**
- ✅ Criar novos usuários (senhas serão criptografadas automaticamente)
- ✅ Fazer login com usuários existentes (funciona com senhas antigas e novas)
- ✅ Verificar que senhas não aparecem em texto plano no banco

## 🔒 Segurança

### **Características do bcrypt:**
- ✅ **Salt único**: Cada senha tem um salt diferente
- ✅ **Adaptativo**: Pode ser ajustado conforme hardware evolui
- ✅ **Lento por design**: Previne ataques de força bruta
- ✅ **Padrão da indústria**: Amplamente utilizado e testado

### **Exemplo de Senha Criptografada:**
```
$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3ZxQQxq6Hy
```

**Onde:**
- `$2b$` = Versão do bcrypt
- `10` = Número de rounds (salt rounds)
- `LQv3c1yqBWVHxkd0LHAkCO` = Salt (22 caracteres)
- `Yz6TtxMQJqhN8/LewdBPj3ZxQQxq6Hy` = Hash da senha (31 caracteres)

## 📁 Arquivos Modificados

### **Backend:**
- ✅ `backend/src/database/userRepository.js` - Funções de criptografia
- ✅ `backend/app.js` - Rota de migração
- ✅ `backend/package.json` - Dependência bcrypt

### **Scripts:**
- ✅ `ScriptSQL_Criptografia.sql` - Preparação do banco
- ✅ `README_Criptografia.md` - Esta documentação

## 🔄 Migração de Senhas Antigas

### **Processo Automático:**
1. **Detecção**: Sistema verifica se senha começa com `$2b$` ou `$2a$`
2. **Comparação**: Se não criptografada, compara diretamente
3. **Migração**: Se criptografada, usa `bcrypt.compare()`

### **Migração Manual:**
```bash
# Executar migração de todas as senhas antigas
POST /api/migrate-passwords
```

## ⚠️ Importante

### **Antes de Executar:**
- ✅ Fazer backup do banco de dados
- ✅ Testar em ambiente de desenvolvimento
- ✅ Verificar se todas as dependências estão instaladas

### **Após a Migração:**
- ✅ Remover a rota `/api/migrate-passwords` em produção
- ✅ Monitorar logs para verificar sucesso da migração
- ✅ Testar login de todos os usuários existentes

## 🧪 Testes

### **Cenários de Teste:**
1. ✅ Criar novo usuário (senha criptografada)
2. ✅ Login com usuário novo
3. ✅ Login com usuário antigo (senha não criptografada)
4. ✅ Migrar senhas antigas
5. ✅ Login após migração

### **Verificação no Banco:**
```sql
-- Verificar se senhas estão criptografadas
SELECT Usuario_Email, 
       CASE 
         WHEN Usuario_Senha LIKE '$2b$%' THEN 'Criptografada'
         ELSE 'Não criptografada'
       END as Status_Senha
FROM Usuario;
```

## 🎯 Benefícios

- ✅ **Segurança**: Senhas não ficam visíveis no banco
- ✅ **Conformidade**: Atende padrões de segurança
- ✅ **Compatibilidade**: Funciona com dados existentes
- ✅ **Escalabilidade**: Preparado para crescimento
- ✅ **Manutenibilidade**: Código limpo e documentado 