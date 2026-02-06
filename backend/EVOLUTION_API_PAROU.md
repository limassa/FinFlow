# ⚠️ Evolution API Parou - Como Reiniciar

## 🎯 Problema

A Evolution API não está acessível. Isso acontece quando:
- Você fechou o terminal onde estava rodando
- O processo foi interrompido
- O computador foi reiniciado

## ✅ Solução: Reiniciar Evolution API

### Passo 1: Abrir Terminal

Abra um novo terminal (Git Bash, PowerShell ou CMD).

### Passo 2: Ir para o Diretório

```bash
cd D:\Negocios\Projetos\Web\projeto-web\services\evolution-api
```

### Passo 3: Iniciar Evolution API

```bash
npm start
```

### Passo 4: Aguardar Iniciar

Aguarde até ver mensagens como:
```
Server is up and running
```

Ou logs indicando que a API está rodando.

### Passo 5: Verificar

1. **Abra no navegador:** `http://localhost:8082`
2. **Deve abrir a interface da Evolution API**
3. **Verifique se a instância `finflow` ainda está conectada**

## 🔄 Manter Evolution API Rodando

### Opção 1: Deixar Terminal Aberto

- **Mantenha o terminal aberto** onde a Evolution API está rodando
- **Não feche** o terminal
- Se fechar, a Evolution API para

### Opção 2: Usar PM2 (Gerenciador de Processos)

Instale PM2 para manter rodando em background:

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar Evolution API com PM2
cd D:\Negocios\Projetos\Web\projeto-web\services\evolution-api
pm2 start npm --name "evolution-api" -- start

# Ver status
pm2 status

# Ver logs
pm2 logs evolution-api

# Parar
pm2 stop evolution-api

# Reiniciar
pm2 restart evolution-api
```

**Vantagens do PM2:**
- ✅ Roda em background
- ✅ Reinicia automaticamente se parar
- ✅ Mantém logs
- ✅ Pode iniciar automaticamente com o sistema

### Opção 3: Criar Script de Inicialização

Crie um arquivo `iniciar-evolution-api.ps1`:

```powershell
cd D:\Negocios\Projetos\Web\projeto-web\services\evolution-api
npm start
```

Execute sempre que precisar iniciar.

## 📋 Verificar se Está Rodando

### Método 1: Testar Acesso

```powershell
Invoke-WebRequest -Uri "http://localhost:8082" -UseBasicParsing
```

**Deve retornar:** Status 200

### Método 2: Ver Porta

```powershell
netstat -ano | findstr :8082
```

**Deve mostrar:** Processo usando a porta 8082

### Método 3: Abrir no Navegador

```
http://localhost:8082
```

**Deve abrir:** Interface da Evolution API

## ⚠️ Importante

**A Evolution API precisa estar rodando** para:
- ✅ Enviar mensagens WhatsApp
- ✅ Criar novas instâncias
- ✅ Gerenciar instâncias existentes

**Se parar:**
- ❌ Não conseguirá enviar mensagens
- ❌ A instância pode desconectar
- ❌ Precisa reiniciar e reconectar

## 💡 Dica

**Para desenvolvimento:**
- Deixe o terminal aberto
- Ou use PM2 para rodar em background

**Para produção:**
- Use PM2 ou similar
- Configure para iniciar automaticamente
- Monitore os logs

## 🔄 Após Reiniciar

1. **Verifique se a instância `finflow` ainda está conectada**
2. **Se desconectou, gere um novo QR Code e escaneie**
3. **Teste o envio novamente**

