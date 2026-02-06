# 🔧 Solução Final: Evolution API - Problema de Database

## 🎯 Situação Atual

A versão `latest` da Evolution API (`atendai/evolution-api:latest`) está rejeitando todos os providers de database:
- ❌ `mongodb` → "Database provider mongodb invalid"
- ❌ `mongo` → "Database provider mongo invalid"  
- ❌ Sem database → "Database provider invalid"

Isso faz com que o container pare imediatamente após iniciar.

## ✅ Soluções Disponíveis

### Solução 1: Usar Instalação Manual (Recomendado)

A instalação manual permite mais controle e geralmente funciona melhor:

1. **Instalar Node.js** (se não tiver):
   - Baixe de: https://nodejs.org/
   - Instale a versão LTS

2. **Clonar repositório:**
   ```bash
   git clone https://github.com/EvolutionAPI/evolution-api.git
   cd evolution-api
   ```

3. **Instalar dependências:**
   ```bash
   npm install
   ```

4. **Configurar `.env`:**
   ```env
   AUTHENTICATION_API_KEY=WebCond_2025_Evolution_API_Chave_Secreta_123!@#
   SERVER_URL=http://localhost:8082
   PORT=8082
   DATABASE_ENABLED=false
   ```

5. **Iniciar:**
   ```bash
   npm start
   ```

6. **Acessar:**
   ```
   http://localhost:8082
   ```

### Solução 2: Usar Versão Específica do Docker

Tente versões específicas que podem funcionar melhor:

```powershell
# Tentar versão 2.3.7
docker run -d `
  --name evolution-api `
  -p 8082:8080 `
  -e AUTHENTICATION_API_KEY="WebCond_2025_Evolution_API_Chave_Secreta_123!@#" `
  atendai/evolution-api:2.3.7
```

Ou outras versões disponíveis no Docker Hub.

### Solução 3: Usar Imagem Alternativa

Algumas imagens alternativas podem funcionar:

```powershell
# Tentar imagem oficial (se existir)
docker run -d `
  --name evolution-api `
  -p 8082:8080 `
  -e AUTHENTICATION_API_KEY="WebCond_2025_Evolution_API_Chave_Secreta_123!@#" `
  evolutionapi/evolution-api:latest
```

### Solução 4: Aguardar Atualização

A versão `latest` pode ter um bug. Você pode:
1. **Aguardar uma atualização** da imagem Docker
2. **Reportar o problema** no repositório oficial: https://github.com/EvolutionAPI/evolution-api

## 📋 Configuração Atual

Se conseguir fazer funcionar, certifique-se de que o `backend/config.env` está assim:

```env
EVOLUTION_API_URL=http://localhost:8082
EVOLUTION_INSTANCE_NAME=webcond
EVOLUTION_API_KEY=WebCond_2025_Evolution_API_Chave_Secreta_123!@#
```

## 🎯 Recomendação

**Use a Solução 1 (Instalação Manual)** porque:
- ✅ Mais controle sobre a configuração
- ✅ Funciona independente de problemas no Docker
- ✅ Mais fácil de debugar
- ✅ Pode configurar database depois se necessário

## 📝 Passos para Instalação Manual

1. **Abra um novo terminal**
2. **Navegue para uma pasta de projetos:**
   ```powershell
   cd D:\Negocios\Projetos
   ```

3. **Clone o repositório:**
   ```powershell
   git clone https://github.com/EvolutionAPI/evolution-api.git
   cd evolution-api
   ```

4. **Instale dependências:**
   ```powershell
   npm install
   ```

5. **Crie arquivo `.env`:**
   ```powershell
   # Copie o exemplo
   copy .env.example .env
   
   # Edite e configure:
   # AUTHENTICATION_API_KEY=WebCond_2025_Evolution_API_Chave_Secreta_123!@#
   # SERVER_URL=http://localhost:8082
   # PORT=8082
   ```

6. **Inicie:**
   ```powershell
   npm start
   ```

7. **Acesse:**
   ```
   http://localhost:8082
   ```

## 🔄 Se Precisar Parar/Iniciar

**Parar:**
- Pressione `Ctrl+C` no terminal

**Iniciar novamente:**
```powershell
cd D:\Negocios\Projetos\evolution-api
npm start
```

## ✅ Após Funcionar

1. Acesse `http://localhost:8082`
2. Crie instância `webcond`
3. Escaneie QR Code
4. Teste a conexão

## 💡 Dica

Se a instalação manual funcionar, você pode criar um script para iniciar facilmente:

**`iniciar-evolution-api.ps1`:**
```powershell
cd D:\Negocios\Projetos\evolution-api
npm start
```

