# 🔧 Configuração de Email - Guia Rápido

## ❌ Erro Corrigido
O erro `createTransporter is not a function` foi corrigido. Agora é `createTransport`.

## 📋 Passos para Configurar

### 1. Instalar Dependências
```bash
cd backend
npm install dotenv
```

### 2. Criar Arquivo .env
Na pasta `backend`, crie um arquivo chamado `.env` (sem extensão) com:

```env
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app
FRONTEND_URL=http://localhost:3000
```

### 3. Configurar Gmail
1. Acesse: https://myaccount.google.com/security
2. Ative "Verificação em duas etapas"
3. Vá para: https://myaccount.google.com/apppasswords
4. Clique "Selecionar app" → "Outro (nome personalizado)"
5. Digite "FinFlow" e clique "Gerar"
6. Copie a senha de 16 caracteres

### 4. Exemplo do Arquivo .env
```env
EMAIL_USER=joao@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
FRONTEND_URL=http://localhost:3000
```

### 5. Testar
1. Reinicie o servidor: `npm start`
2. Cadastre um usuário
3. Verifique seu email

## 🚨 Se Der Erro
- Verifique se o arquivo `.env` está na pasta `backend`
- Confirme se a senha de app está correta
- Olhe na pasta "Spam" do email 