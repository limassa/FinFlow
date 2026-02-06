# 🚀 Iniciar Docker Rapidamente

## ✅ Docker está Instalado!

O Docker está instalado no seu sistema, mas o serviço está parado.

## 🚀 Como Iniciar

### Método 1: Abrir Docker Desktop (Mais Fácil)

1. **Pressione `Windows + S`**
2. **Digite "Docker Desktop"**
3. **Clique para abrir**
4. **Aguarde o Docker iniciar** (ícone na bandeja do sistema)
5. **Quando o ícone parar de animar, está pronto!**

### Método 2: Via PowerShell

Execute no PowerShell:

```powershell
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

Aguarde alguns segundos e verifique:

```powershell
docker ps
```

Se não der erro, o Docker está funcionando!

### Método 3: Via Script

```powershell
cd backend
.\iniciar-docker.ps1
```

## ⏳ Aguardar Docker Iniciar

Após abrir o Docker Desktop:
- O ícone do Docker aparecerá na **bandeja do sistema** (canto inferior direito)
- O ícone ficará **animado** enquanto está iniciando
- Quando o ícone **parar de animar**, o Docker está pronto
- Isso pode levar **1-2 minutos**

## ✅ Verificar se Está Funcionando

Execute:

```bash
docker ps
```

Se mostrar uma lista (mesmo que vazia), o Docker está funcionando!

## 🔄 Após Docker Iniciar

Execute o script de instalação da Evolution API:

```bash
cd backend
bash instalar-evolution-api.sh
```

ou

```powershell
cd backend
.\instalar-evolution-api.ps1
```

## 💡 Dica

Para evitar ter que iniciar manualmente toda vez:
1. Abra o Docker Desktop
2. Vá em **Settings** (⚙️)
3. Vá em **General**
4. Marque **"Start Docker Desktop when you log in"**

