# FinFlow - Sistema de Controle Financeiro

## Sobre o Sistema

**FinFlow** é um sistema de controle financeiro pessoal desenvolvido pela **Liz Softwares**, focado em simplicidade e eficiência para o gerenciamento de receitas e despesas.

## Características Principais

### 📊 Dashboard Intuitivo
- Visão geral das finanças em tempo real
- Cards informativos com totais de receitas, despesas e saldo
- Interface responsiva e moderna

### 💰 Gestão de Receitas
- Cadastro de diferentes tipos de receitas
- Categorização por tipo (Salário, Venda, Presente, etc.)
- Filtros por período
- Histórico completo

### 💸 Controle de Despesas
- Registro de despesas por categoria
- Tipos: Alimentação, Transporte, Saúde, Moradia, etc.
- Acompanhamento de gastos
- Análise de padrões de consumo

### 📈 Relatórios e Análises
- Resumo financeiro por período
- Comparativo receitas vs despesas
- Gráficos informativos (em desenvolvimento)

## Tecnologias Utilizadas

- **Frontend**: React.js
- **Backend**: Node.js com Express
- **Banco de Dados**: PostgreSQL
- **Estilização**: CSS3 com design responsivo
- **Ícones**: React Icons

## Estrutura do Projeto

```
projeto-web/
├── frontend/          # Aplicação React
├── backend/           # API Node.js
├── src/
│   ├── pages/        # Componentes de páginas
│   ├── components/   # Componentes reutilizáveis
│   └── functions/    # Funções utilitárias
└── public/           # Arquivos estáticos
```

## Instalação e Uso

### Pré-requisitos
- Node.js (versão 14 ou superior)
- PostgreSQL
- npm ou yarn

### Configuração

1. **Clone o repositório**
```bash
git clone [url-do-repositorio]
cd projeto-web
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o banco de dados**
```bash
# Execute o script SQL para criar as tabelas
psql -U seu_usuario -d seu_banco -f ScriptSQL.sql
```

4. **Configure as variáveis de ambiente**
```bash
# Crie um arquivo .env no backend
cp backend/.env.example backend/.env
# Edite as configurações do banco de dados
```

5. **Inicie o servidor**
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
npm start
```

## Funcionalidades

### Autenticação
- Sistema de login e cadastro
- Sessões seguras
- Logout automático

### Dashboard Principal
- Visão geral das finanças
- Navegação rápida para receitas e despesas
- Estatísticas em tempo real

### Gestão de Dados
- CRUD completo para receitas e despesas
- Validação de dados
- Confirmações de ações importantes

### Responsividade
- Interface adaptável para mobile
- Menu lateral colapsável
- Design otimizado para diferentes telas

## Sobre a Liz Softwares

**Liz Softwares** é uma empresa especializada em desenvolvimento de soluções tecnológicas, focada em criar sistemas intuitivos e eficientes que resolvem problemas reais dos usuários.

### Missão
Desenvolver software de qualidade que simplifique a vida das pessoas, oferecendo soluções práticas e acessíveis.

### Visão
Ser reconhecida como uma empresa inovadora no desenvolvimento de soluções tecnológicas personalizadas.

## Contato

Para mais informações sobre o FinFlow ou outros produtos da Liz Softwares:

- **Email**: contato@lizsoftwares.com
- **Website**: www.lizsoftwares.com
- **Telefone**: (XX) XXXX-XXXX

---

**FinFlow** - Controle Financeiro Simplificado  
Desenvolvido com ❤️ pela **Liz Softwares** 