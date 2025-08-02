# Guia de Branches e Ambientes - FinFlow

## 📋 Estrutura de Branches

### 🌿 Branch `teste`
- **Banco de Dados:** Local (FinFlowTeste)
- **Host:** localhost:5433
- **Usuário:** postgres
- **Senha:** admin
- **Ambiente:** Desenvolvimento local
- **NODE_ENV:** development

### 🌿 Branch `homologacao`
- **Banco de Dados:** Railway
- **Host:** interchange.proxy.rlwy.net:50880
- **Database:** railway
- **Ambiente:** Homologação/Staging
- **NODE_ENV:** development

### 🌿 Branch `producao`
- **Banco de Dados:** Railway
- **Host:** interchange.proxy.rlwy.net:50880
- **Database:** railway
- **Ambiente:** Produção
- **NODE_ENV:** production

## 🚀 Como Usar

### 1. Desenvolvimento Local (Branch `teste`)
```bash
git checkout teste
npm start
```

### 2. Testes em Homologação (Branch `homologacao`)
```bash
git checkout homologacao
npm start
```

### 3. Deploy em Produção (Branch `producao`)
```bash
git checkout producao
npm start
```

## 📁 Estrutura de Pastas

```
projeto-web/
├── scripts/           # Scripts de banco de dados
│   ├── *.js          # Scripts Node.js
│   └── *.sql         # Scripts SQL
├── documentacao/      # Documentação do projeto
│   ├── *.md          # Arquivos Markdown
│   └── README.md     # Documentação principal
├── testes/           # Scripts de teste
│   ├── *.js          # Testes automatizados
│   └── *.md          # Documentação de testes
├── backend/          # Backend Node.js
├── src/              # Frontend React
└── public/           # Arquivos públicos
```

## 🔧 Scripts Disponíveis

### Scripts de Banco de Dados (pasta `scripts/`)
- `criar-tabela-versao.js` - Criar tabela de versão no banco local
- `criar-tabela-versao-railway.js` - Criar tabela de versão no Railway
- `ScriptSQL_Versao.sql` - Script SQL da tabela de versão
- `configurar-banco-local.js` - Configurar banco local
- `corrigir-*.js` - Scripts de correção de dados

### Scripts de Teste (pasta `testes/`)
- `teste-endpoint-versao-local.js` - Testar endpoint local
- `teste-endpoint-versao-railway.js` - Testar endpoint Railway
- `teste-versao.js` - Teste geral da funcionalidade

## 📊 Configurações de Banco

### Banco Local (Teste)
```javascript
// backend/src/database/connection.js
const pool = new Pool({
  host: 'localhost',
  port: 5433,
  database: 'FinFlowTeste',
  user: 'postgres',
  password: 'admin'
});
```

### Banco Railway (Homologação/Produção)
```javascript
// backend/src/database/connection.js
const DATABASE_URL = process.env.DATABASE_URL || 
  `postgresql://postgres:OumtwkgYJuWpNCAxJfLVAecULdKGjMEP@interchange.proxy.rlwy.net:50880/railway`;

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
```

## 🧪 Como Testar

### 1. Testar Banco Local
```bash
cd scripts
node criar-tabela-versao.js
```

### 2. Testar Banco Railway
```bash
cd scripts
node criar-tabela-versao-railway.js
```

### 3. Testar Endpoint Local
```bash
cd testes
node teste-endpoint-versao-local.js
```

### 4. Testar Endpoint Railway
```bash
cd testes
node teste-endpoint-versao-railway.js
```

## 🔄 Fluxo de Desenvolvimento

1. **Desenvolvimento:** Trabalhe na branch `teste` com banco local
2. **Testes:** Mude para `homologacao` para testar no Railway
3. **Deploy:** Use a branch `producao` para produção

## ⚠️ Importante

- Sempre verifique em qual branch está antes de fazer alterações
- Use `git status` para verificar mudanças pendentes
- Faça commit das alterações antes de trocar de branch
- Use `git stash` se precisar salvar mudanças temporariamente

## 📝 Logs de Conexão

Cada ambiente mostra logs específicos:
- **Teste:** "AMBIENTE TESTE"
- **Homologação:** "AMBIENTE HOMOLOGAÇÃO"
- **Produção:** "AMBIENTE PRODUÇÃO" 