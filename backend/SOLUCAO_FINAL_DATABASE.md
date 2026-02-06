# 🔧 Solução Final: Erro Database Provider

## 🎯 Situação

A Evolution API está rejeitando os providers de database (`mongodb`, `mongo`, etc.).

Isso pode acontecer porque:
1. A versão `latest` da Evolution API pode ter mudado
2. A configuração de database mudou na versão mais recente
3. Algumas versões não suportam database externo

## ✅ Solução: Usar sem Database (Recomendado para Testes)

A Evolution API pode funcionar **sem database** para testes e desenvolvimento:

```powershell
# Parar container atual
docker stop evolution-api
docker rm evolution-api

# Criar sem database
docker run -d `
  --name evolution-api `
  -p 8080:8080 `
  -e AUTHENTICATION_API_KEY="WebCond_2025_Evolution_API_Chave_Secreta_123!@#" `
  -e DATABASE_ENABLED=false `
  atendai/evolution-api:latest
```

**Vantagens:**
- ✅ Funciona imediatamente
- ✅ Sem configuração de database
- ✅ Perfeito para testes e desenvolvimento
- ✅ Dados armazenados em memória/arquivos locais

**Desvantagens:**
- ⚠️ Dados podem ser perdidos se o container for removido
- ⚠️ Não recomendado para produção

## 🔄 Alternativa: Usar Versão Específica

Se precisar de database, tente uma versão específica:

```powershell
docker run -d `
  --name evolution-api `
  -p 8080:8080 `
  --link evolution-mongodb:mongo `
  -e AUTHENTICATION_API_KEY="WebCond_2025_Evolution_API_Chave_Secreta_123!@#" `
  -e DATABASE_ENABLED=true `
  -e DATABASE_PROVIDER=mongodb `
  -e DATABASE_CONNECTION_URI="mongodb://admin:admin123@evolution-mongodb:27017/evolution?authSource=admin" `
  atendai/evolution-api:2.0.0
```

## 📋 Verificar se Funcionou

```powershell
docker logs evolution-api --tail 30
```

**O que você deve ver:**
- ✅ Sem erros de "Database provider invalid"
- ✅ Mensagens de inicialização
- ✅ API rodando

## 🌐 Acessar Interface

Após resolver:
1. Acesse: `http://localhost:8080`
2. Crie instância `webcond`
3. Escaneie QR Code

## 💡 Nota Importante

Para **produção**, você precisará configurar um database adequado. Mas para **testes e desenvolvimento**, funcionar sem database é perfeitamente aceitável.

