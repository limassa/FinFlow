# 💰 Sistema FinFlow - Guia Completo

## ✅ **Status Atual**
- ✅ **Projeto:** FinFlow - Controle Financeiro
- ✅ **Arquivos:** Restaurados
- ✅ **Dependências:** Instaladas
- ✅ **Estrutura:** Correta

## 🚀 **Como Rodar o Sistema FinFlow**

### **1. Rodar Frontend**
```bash
npm start
```
**URL:** http://localhost:3000

### **2. Rodar Backend**
```bash
npm run backend
```
**URL:** http://localhost:3001

### **3. Rodar Sistema Completo**
```bash
# Terminal 1 - Backend
npm run backend

# Terminal 2 - Frontend
npm start
```

## 📋 **Estrutura do Projeto**

### **Arquivos Principais**
```
finflow/
├── src/                    # Frontend React
│   ├── components/         # Componentes
│   │   ├── Header.js       # Cabeçalho com logo FinFlow
│   │   ├── GraficoEvolucaoMensal.js # Gráfico de evolução
│   │   └── GraficosPizza.js # Gráficos de pizza
│   ├── pages/             # Páginas do sistema
│   │   ├── Principal.js   # Dashboard principal
│   │   ├── Receita.js     # Controle de receitas
│   │   ├── Despesa.js     # Controle de despesas
│   │   ├── Contas.js      # Gestão de contas
│   │   ├── Configuracoes.js # Configurações
│   │   └── FaleConosco.js # Contato
│   ├── config/            # Configurações
│   └── functions/         # Funções utilitárias
├── backend/               # API Node.js
├── public/                # Arquivos públicos
├── ScriptSQL.sql         # Banco de dados FinFlow
└── README-FinFlow.md     # Documentação
```

## 🎯 **Funcionalidades do FinFlow**

### **🏠 Dashboard Principal**
- Visão geral das finanças
- Gráficos de receitas e despesas
- Resumo mensal
- Acesso rápido às funcionalidades

### **💰 Controle de Receitas**
- Registro de receitas
- Categorização
- Status de recebimento
- Histórico de receitas

### **💸 Controle de Despesas**
- Registro de despesas
- Categorização
- Status de pagamento
- Histórico de despesas

### **🏦 Gestão de Contas**
- Contas bancárias
- Saldos
- Movimentações
- Relatórios

### **⚙️ Configurações**
- Dados pessoais
- Configurações do sistema
- Categorias personalizadas

### **📞 Fale Conosco**
- Formulário de contato
- Suporte ao cliente

## 🗄️ **Banco de Dados**

### **Script Principal**
- **Arquivo:** `ScriptSQL.sql`
- **Tabelas:** Usuario, Receita, Despesa, Conta, etc.
- **Configuração:** PostgreSQL local

### **Configuração Local**
```env
DB_HOST=localhost
DB_PORT=5433
DB_NAME=finflowteste
DB_USER=postgres
DB_PASSWORD=admin
```

## 🔧 **Comandos Úteis**

### **Desenvolvimento**
```bash
# Instalar dependências
npm install

# Rodar frontend
npm start

# Rodar backend
npm run backend

# Build para produção
npm run build
```

### **Banco de Dados**
```bash
# Criar banco
CREATE DATABASE finflowteste;

# Executar script
psql -U postgres -d finflowteste -f ScriptSQL.sql
```

## 📊 **URLs do Sistema**

### **Frontend**
- **Principal:** http://localhost:3000
- **Login:** http://localhost:3000/login
- **Dashboard:** http://localhost:3000/principal
- **Receitas:** http://localhost:3000/receita
- **Despesas:** http://localhost:3000/despesa
- **Contas:** http://localhost:3000/contas
- **Configurações:** http://localhost:3000/configuracoes

### **Backend**
- **API:** http://localhost:3001
- **Teste:** http://localhost:3001/

## 🎨 **Interface**

### **Design**
- Layout moderno e responsivo
- Cores da Liz Softwares
- Gráficos interativos
- Compatível com mobile

### **Componentes**
- Header com logo FinFlow
- Gráficos Chart.js
- Tabelas de dados
- Formulários
- Cards informativos

## 📈 **Gráficos e Relatórios**

### **Gráfico de Evolução Mensal**
- Últimos 12 meses
- Receitas vs Despesas
- Formatação em moeda brasileira
- Interativo

### **Gráficos de Pizza**
- Distribuição por categoria
- Receitas e despesas
- Cores intuitivas

## 🚀 **Próximos Passos**

### **1. Configurar Banco**
```bash
# Instalar PostgreSQL
# Criar banco finflowteste
# Executar ScriptSQL.sql
```

### **2. Testar Sistema**
```bash
# Terminal 1
npm run backend

# Terminal 2
npm start
```

### **3. Acessar Sistema**
- Abrir: http://localhost:3000
- Fazer login
- Testar funcionalidades

## 📝 **Logs Úteis**

### **Frontend**
```
Compiled successfully!
Local: http://localhost:3000
```

### **Backend**
```
🔌 Configuração do banco de dados:
✅ Conexão com o banco estabelecida
🚀 Servidor rodando na porta 3001
```

## 🔧 **Correções Aplicadas**

### **Banco de Dados**
- ✅ Tabelas Receita e Despesa corrigidas
- ✅ Colunas de recorrência adicionadas
- ✅ Índices otimizados

### **Frontend**
- ✅ Gráficos Chart.js funcionando
- ✅ Componentes organizados
- ✅ Dependências instaladas

---

**Status:** ✅ FinFlow restaurado e funcionando  
**URL:** http://localhost:3000  
**Próximo passo:** Configurar banco de dados  
**Última atualização:** 01/08/2025 