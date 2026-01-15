# 🐳 Como Iniciar o Docker

Este guia explica como iniciar o Docker no Windows.

## 🔍 Verificar se Docker está Instalado

### Método 1: Verificar Versão

```bash
docker --version
```

Se mostrar a versão (ex: `Docker version 24.0.0`), o Docker está instalado.

### Método 2: Verificar Docker Desktop

No Windows, o Docker geralmente é o **Docker Desktop**.

1. **Procure por "Docker Desktop" no menu Iniciar**
2. Se encontrar, o Docker está instalado
3. Se não encontrar, você precisa instalar o Docker Desktop

## 🚀 Como Iniciar o Docker

### Opção 1: Docker Desktop (Recomendado)

1. **Abra o Docker Desktop:**
   - Pressione `Windows + S`
   - Digite "Docker Desktop"
   - Clique para abrir

2. **Aguarde o Docker iniciar:**
   - O ícone do Docker aparecerá na bandeja do sistema (canto inferior direito)
   - Quando o ícone parar de animar, o Docker está pronto
   - Isso pode levar 1-2 minutos na primeira vez

3. **Verificar se está rodando:**
   ```bash
   docker ps
   ```
   Se não der erro, o Docker está funcionando!

### Opção 2: Via Serviços do Windows

1. **Abra "Serviços":**
   - Pressione `Windows + R`
   - Digite: `services.msc`
   - Pressione Enter

2. **Procure por serviços do Docker:**
   - Procure por "Docker" na lista
   - Exemplos: "Docker Desktop Service", "com.docker.service"

3. **Inicie o serviço:**
   - Clique com botão direito no serviço
   - Clique em "Iniciar"

### Opção 3: Via PowerShell (Como Administrador)

```powershell
# Iniciar serviço Docker (se existir)
Start-Service -Name "com.docker.service" -ErrorAction SilentlyContinue

# Ou tentar iniciar Docker Desktop
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

## ✅ Verificar se Docker Está Funcionando

Após iniciar o Docker, teste:

```bash
# Verificar versão
docker --version

# Ver containers (deve funcionar sem erro)
docker ps

# Ver informações do Docker
docker info
```

Se todos os comandos funcionarem, o Docker está pronto!

## ⚠️ Problemas Comuns

### Problema: "Docker não está rodando"

**Soluções:**
1. Abra o Docker Desktop manualmente
2. Aguarde até o ícone na bandeja parar de animar
3. Verifique se há atualizações pendentes do Docker Desktop

### Problema: "Cannot connect to the Docker daemon"

**Soluções:**
1. Certifique-se de que o Docker Desktop está aberto
2. Reinicie o Docker Desktop
3. Reinicie o computador (se necessário)

### Problema: Docker não inicia

**Soluções:**
1. Verifique se a virtualização está habilitada no BIOS
2. Verifique se o WSL 2 está instalado (Windows)
3. Reinstale o Docker Desktop

### Problema: "Docker Desktop is starting..."

**Solução:**
- Aguarde! O Docker pode levar alguns minutos para iniciar
- Verifique o ícone na bandeja do sistema
- Quando parar de animar, está pronto

## 🔄 Após Iniciar o Docker

1. **Aguarde o Docker estar totalmente iniciado** (ícone parado na bandeja)
2. **Execute o script novamente:**
   ```bash
   cd backend
   bash instalar-evolution-api.sh
   ```
   ou
   ```powershell
   cd backend
   .\instalar-evolution-api.ps1
   ```

## 📋 Checklist

- [ ] Docker Desktop instalado
- [ ] Docker Desktop aberto
- [ ] Ícone do Docker na bandeja (não animando)
- [ ] `docker ps` funciona sem erros
- [ ] Script de instalação executado com sucesso

## 💡 Dica

**Para facilitar no futuro:**
- Configure o Docker Desktop para iniciar automaticamente com o Windows
- Vá em: Docker Desktop → Settings → General → "Start Docker Desktop when you log in"

