# Sistema PDV - Ponto de Venda

## Descrição
Sistema de Ponto de Venda desenvolvido pela **Liz Softwares** para controle de vendas, produtos, clientes e estoque.

## Características

### 🎯 Funcionalidades Principais
- **Controle de Vendas**: Registro e acompanhamento de vendas
- **Gestão de Produtos**: Cadastro e controle de estoque
- **Cadastro de Clientes**: Gestão completa de clientes
- **Relatórios**: Geração de relatórios de vendas
- **Configurações**: Personalização do sistema

### 🎨 Interface
- Design moderno e responsivo
- Layout intuitivo e fácil de usar
- Cores e identidade visual da Liz Softwares
- Compatível com dispositivos móveis

### 🔧 Tecnologias Utilizadas
- **Frontend**: React.js
- **Backend**: Node.js + Express
- **Banco de Dados**: MySQL
- **Estilização**: CSS3
- **Ícones**: React Icons

## Estrutura do Projeto

```
sistema-pdv/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   ├── pages/              # Páginas do sistema
│   │   ├── Vendas.js       # Controle de vendas
│   │   ├── Produtos.js     # Gestão de produtos
│   │   ├── Clientes.js     # Cadastro de clientes
│   │   ├── Principal.js    # Dashboard principal
│   │   └── FaleConosco.js  # Página de contato
│   ├── config/             # Configurações
│   ├── functions/          # Funções utilitárias
│   └── images/             # Imagens e logos
├── backend/                # API e banco de dados
├── public/                 # Arquivos públicos
└── ScriptSQL_PDV.sql      # Script do banco de dados
```

## Páginas do Sistema

### 🏠 Dashboard Principal
- Visão geral das vendas
- Estatísticas do dia
- Acesso rápido às funcionalidades
- Gráficos de análise

### 🛒 Controle de Vendas
- Registro de novas vendas
- Histórico de vendas
- Filtros e busca
- Impressão de comprovantes
- Status das vendas (Pendente, Concluída, Cancelada)

### 📦 Gestão de Produtos
- Cadastro de produtos
- Controle de estoque
- Categorização
- Preços e custos
- Fornecedores

### 👥 Cadastro de Clientes
- Dados completos dos clientes
- Histórico de compras
- Informações de contato
- Endereços

### ⚙️ Configurações
- Dados da empresa
- Configurações do sistema
- Usuários e permissões
- Backup e restauração

### 📞 Fale Conosco
- Formulário de contato
- Suporte ao cliente
- Sugestões e dúvidas
- Reportar problemas

## Banco de Dados

### 📊 Tabelas Principais
- **Usuario**: Usuários do sistema
- **Cliente**: Cadastro de clientes
- **Produto**: Produtos e estoque
- **Venda**: Registro de vendas
- **VendaItem**: Itens de cada venda
- **Categoria**: Categorias de produtos
- **Fornecedor**: Fornecedores
- **EstoqueMovimento**: Movimentação de estoque
- **Configuracao**: Configurações do sistema
- **Contato**: Mensagens do fale conosco

### 🔍 Padrão de Nomenclatura
Todas as colunas seguem o padrão: `Tabela_Atributo`
Exemplos:
- `Cliente_Nome`
- `Produto_Preco`
- `Venda_Data`
- `Usuario_Email`

## Instalação e Configuração

### Pré-requisitos
- Node.js 18.x ou superior
- MySQL 8.0 ou superior
- NPM ou Yarn

### Passos para Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/limassa/SistemaPDV.git
cd SistemaPDV
```

2. **Instale as dependências**
```bash
npm install
cd backend && npm install
```

3. **Configure o banco de dados**
```bash
# Execute o script SQL
mysql -u root -p < ScriptSQL_PDV.sql
```

4. **Configure as variáveis de ambiente**
```bash
# Copie o arquivo de exemplo
cp backend/config.env.example backend/config.env

# Edite as configurações
nano backend/config.env
```

5. **Inicie o sistema**
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## Configurações do Sistema

### Variáveis de Ambiente
```env
# Banco de Dados
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=sistema_pdv

# Servidor
PORT=3000
NODE_ENV=development

# Email (opcional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha
```

## Funcionalidades Avançadas

### 📈 Relatórios
- Relatório de vendas por período
- Relatório de produtos mais vendidos
- Relatório de clientes
- Relatório de estoque
- Exportação em PDF

### 🔐 Segurança
- Autenticação de usuários
- Controle de permissões
- Criptografia de senhas
- Logs de atividades

### 📱 Responsividade
- Interface adaptável
- Funciona em tablets e celulares
- Touch-friendly

## Suporte e Contato

### 🆘 Suporte Técnico
- **Email**: suporte@lizsoftwares.com
- **Telefone**: (11) 99999-9999
- **Horário**: Segunda a Sexta, 8h às 18h

### 📞 Fale Conosco
- Sugestões e melhorias
- Reportar bugs
- Dúvidas sobre funcionalidades
- Solicitar treinamento

## Versões

### v1.0.0 (Atual)
- ✅ Controle básico de vendas
- ✅ Gestão de produtos
- ✅ Cadastro de clientes
- ✅ Relatórios básicos
- ✅ Interface responsiva

### Próximas Versões
- 🔄 Integração com impressoras térmicas
- 🔄 Controle de caixa
- 🔄 Integração com PIX
- 🔄 App mobile
- 🔄 Backup automático

## Licença

Este projeto é desenvolvido pela **Liz Softwares** e está sob licença MIT.

---

**Desenvolvido com ❤️ pela Liz Softwares** 