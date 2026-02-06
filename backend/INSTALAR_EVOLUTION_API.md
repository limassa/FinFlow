# 🐳 Como Instalar a Evolution API com Docker

## 📍 Onde Executar o Comando

**Resposta direta:** Você pode executar o comando `docker run` de **qualquer pasta**! 

O Docker funciona de forma global no sistema, então não importa em qual diretório você está quando executa o comando.

## 🚀 Comando Completo

### Executar do Diretório Raiz (Recomendado)

```bash
# Navegue até o diretório raiz do projeto (se ainda não estiver lá)
cd D:\Negocios\Projetos\Web\projeto-web

# Execute o comando Docker
docker run -d \
  --name evolution-api \
  -p 8080:8080 \
  -e AUTHENTICATION_API_KEY=sua-chave-aqui \
  atendai/evolution-api:latest
```

### Ou Execute de Qualquer Lugar

```bash
# Pode executar de qualquer pasta, por exemplo:
cd C:\
docker run -d --name evolution-api -p 8080:8080 atendai/evolution-api:latest

# Ou até mesmo:
docker run -d --name evolution-api -p 8080:8080 atendai/evolution-api:latest
```

## ✅ Verificar se Está Funcionando

### 1. Verificar se o Container Está Rodando

```bash
docker ps
```

Você deve ver algo como:
```
CONTAINER ID   IMAGE                      STATUS         PORTS                    NAMES
abc123def456   atendai/evolution-api:latest   Up 5 minutes   0.0.0.0:8080->8080/tcp   evolution-api
```

### 2. Verificar os Logs

```bash
docker logs evolution-api
```

### 3. Acessar a Interface

Abra no navegador: `http://localhost:8080`

## 🔧 Comandos Úteis

### Parar o Container

```bash
docker stop evolution-api
```

### Iniciar o Container (se já existe)

```bash
docker start evolution-api
```

### Remover o Container

```bash
docker rm evolution-api
```

### Remover Container e Imagem

```bash
docker stop evolution-api
docker rm evolution-api
docker rmi atendai/evolution-api:latest
```

### Ver todos os containers (incluindo parados)

```bash
docker ps -a
```

## ⚠️ Problemas Comuns

### Erro: "port 8080 is already allocated"

**Solução:** Altere a porta ou pare o serviço que está usando a porta 8080

```bash
# Usar porta diferente (exemplo: 8081)
docker run -d --name evolution-api -p 8081:8080 atendai/evolution-api:latest

# E atualize o config.env:
# EVOLUTION_API_URL=http://localhost:8081
```

### Erro: "container name already exists"

**Solução:** Remova o container existente primeiro

```bash
docker rm -f evolution-api
docker run -d --name evolution-api -p 8080:8080 atendai/evolution-api:latest
```

### Container não inicia

**Solução:** Verifique os logs

```bash
docker logs evolution-api
```

## 📝 Resumo

- ✅ **Pode executar de qualquer pasta** - Docker é global
- ✅ **Recomendado:** Executar do diretório raiz do projeto
- ✅ **Porta padrão:** 8080
- ✅ **Nome do container:** evolution-api

## 🔗 Próximos Passos

Após instalar a Evolution API:

1. Execute o script SQL: `backend/scripts/add-whatsapp-column.sql`
2. Configure o `backend/config.env`
3. Siga o guia completo: `backend/CONFIGURACAO_WHATSAPP.md`

