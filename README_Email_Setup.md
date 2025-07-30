# Configuração de Email e Validação de Senha - FinFlow

## 🚀 Funcionalidades Implementadas

### 1. Validação de Segurança de Senha
- **Comprimento mínimo**: 8 caracteres
- **Letras maiúsculas**: Pelo menos uma
- **Letras minúsculas**: Pelo menos uma
- **Números**: Pelo menos um
- **Caracteres especiais**: Pelo menos um (!@#$%^&*()_+-=[]{}|;:,.<>?)
- **Proteção contra sequências comuns**: Não permite 123, abc, qwe, etc.
- **Proteção contra repetição**: Não permite caracteres repetidos em sequência
- **Indicador de força**: Mostra se a senha é fraca, média, forte ou muito forte

### 2. Sistema de Email
- **Email de boas-vindas**: Enviado automaticamente após cadastro
- **Redefinição de senha**: Sistema completo com token seguro
- **Alertas de segurança**: Notificações por email para atividades suspeitas

## 📧 Configuração de Email

### 1. Configurar Gmail (Recomendado)

1. **Ativar autenticação de 2 fatores** na sua conta Google
2. **Gerar senha de app**:
   - Acesse: https://myaccount.google.com/apppasswords
   - Selecione "Email" e "Outro (nome personalizado)"
   - Digite "FinFlow" e clique em "Gerar"
   - Copie a senha gerada (16 caracteres)

3. **Criar arquivo .env** no backend:
```bash
cd backend
cp config.env.example .env
```

4. **Editar o arquivo .env**:
```env
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app-gerada
FRONTEND_URL=http://localhost:3000
```

### 2. Configurar Outlook/Hotmail

1. **Ativar autenticação de 2 fatores**
2. **Gerar senha de app** nas configurações de segurança
3. **Editar o arquivo .env**:
```env
EMAIL_USER=seu-email@outlook.com
EMAIL_PASS=sua-senha-de-app
FRONTEND_URL=http://localhost:3000
```

### 3. Configurar Yahoo

1. **Ativar autenticação de 2 fatores**
2. **Gerar senha de app**
3. **Editar o arquivo .env**:
```env
EMAIL_USER=seu-email@yahoo.com
EMAIL_PASS=sua-senha-de-app
FRONTEND_URL=http://localhost:3000
```

## 🗄️ Configuração do Banco de Dados

### 1. Executar Script SQL

Execute o script `ScriptSQL_ResetPassword.sql` no seu banco PostgreSQL:

```sql
-- Adicionar campos para redefinição de senha
ALTER TABLE Usuario 
ADD COLUMN IF NOT EXISTS Usuario_ResetToken VARCHAR(255),
ADD COLUMN IF NOT EXISTS Usuario_ResetExpiry TIMESTAMP;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_usuario_reset_token ON Usuario(Usuario_ResetToken);
```

### 2. Verificar Instalação

```bash
# No backend
cd backend
npm install nodemailer validator
```

## 🔧 Instalação das Dependências

### Backend
```bash
cd backend
npm install nodemailer validator
```

### Frontend
```bash
# As dependências já estão instaladas
npm install
```

## 🚀 Como Usar

### 1. Cadastro com Validação de Senha
- Acesse `/cadastro`
- Digite uma senha e veja a validação em tempo real
- O sistema mostrará requisitos de segurança
- Email de boas-vindas será enviado automaticamente

### 2. Redefinição de Senha
- Na página de login, clique em "Esqueci minha senha"
- Digite seu email cadastrado
- Verifique seu email e clique no link de redefinição
- Crie uma nova senha seguindo os requisitos de segurança

### 3. Alertas de Segurança
- O sistema envia alertas por email para:
  - Redefinição de senha
  - Login de localização suspeita (futuro)
  - Alterações importantes na conta (futuro)

## 🔒 Segurança Implementada

### Validação de Senha
- ✅ Comprimento mínimo de 8 caracteres
- ✅ Múltiplos tipos de caracteres
- ✅ Proteção contra sequências comuns
- ✅ Proteção contra repetição
- ✅ Indicador de força visual

### Sistema de Email
- ✅ Tokens seguros para redefinição
- ✅ Expiração automática (1 hora)
- ✅ Templates HTML responsivos
- ✅ Tratamento de erros robusto

### Banco de Dados
- ✅ Senhas criptografadas com bcrypt
- ✅ Tokens únicos para redefinição
- ✅ Expiração automática de tokens
- ✅ Índices para performance

## 🐛 Solução de Problemas

### Email não está sendo enviado
1. Verifique as configurações no arquivo `.env`
2. Confirme se a senha de app está correta
3. Verifique se o email não está na pasta spam
4. Teste com diferentes provedores (Gmail, Outlook, Yahoo)

### Validação de senha não funciona
1. Verifique se o backend está rodando na porta 3001
2. Confirme se as rotas estão acessíveis
3. Verifique o console do navegador para erros

### Token de redefinição não funciona
1. Verifique se o script SQL foi executado
2. Confirme se os campos foram adicionados na tabela
3. Verifique se o token não expirou (1 hora)

## 📝 Notas Importantes

- **Em produção**: Configure um serviço de email profissional (SendGrid, Mailgun, etc.)
- **Segurança**: Nunca commite o arquivo `.env` no repositório
- **Performance**: Os emails são enviados em background para não bloquear a resposta
- **UX**: O sistema mostra feedback visual em tempo real para validação de senha

## 🔄 Próximos Passos

1. **Implementar rate limiting** para evitar spam
2. **Adicionar captcha** para formulários sensíveis
3. **Implementar login de dois fatores** (2FA)
4. **Adicionar logs de auditoria** para atividades de segurança
5. **Implementar blacklist de senhas** comuns 