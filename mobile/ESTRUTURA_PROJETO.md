# 📁 Estrutura do Projeto FinFlow Mobile

## Visão Geral

```
mobile/
├── App.js                      # Componente principal e navegação
├── app.json                    # Configuração do Expo
├── babel.config.js            # Configuração do Babel
├── package.json               # Dependências do projeto
├── .gitignore                 # Arquivos ignorados pelo Git
│
├── assets/                    # Imagens e recursos (você precisa criar)
│   ├── icon.png              # Ícone do app (1024x1024)
│   ├── splash.png            # Tela de splash
│   ├── adaptive-icon.png     # Ícone adaptativo Android
│   └── favicon.png           # Favicon web
│
├── src/
│   ├── config/
│   │   └── api.js            # Configuração da API e endpoints
│   │
│   ├── context/
│   │   └── AuthContext.js    # Context de autenticação global
│   │
│   ├── screens/              # Telas do aplicativo
│   │   ├── LoginScreen.js    # Tela de login
│   │   ├── CadastroScreen.js # Tela de cadastro
│   │   ├── HomeScreen.js     # Dashboard principal
│   │   ├── ReceitaScreen.js  # Gestão de receitas
│   │   ├── DespesaScreen.js  # Gestão de despesas
│   │   ├── ContasScreen.js   # Gestão de contas
│   │   └── ConfiguracoesScreen.js # Configurações
│   │
│   ├── theme/
│   │   └── theme.js          # Tema, cores e estilos globais
│   │
│   └── utils/
│       └── formatters.js     # Funções de formatação (valores, datas)
│
└── README.md                  # Documentação principal
```

## 📋 Descrição dos Arquivos

### Arquivos de Configuração

- **App.js**: Ponto de entrada do app, configura navegação e providers
- **app.json**: Configuração do Expo (nome, ícone, splash screen, etc.)
- **package.json**: Lista de dependências e scripts do projeto
- **babel.config.js**: Configuração do Babel para transpilação

### Configuração

- **src/config/api.js**: 
  - Define a URL base da API
  - Exporta todos os endpoints da API
  - Configuração diferente para dev/produção

### Context

- **src/context/AuthContext.js**:
  - Gerencia estado de autenticação global
  - Funções de login, cadastro e logout
  - Armazena usuário de forma segura

### Screens (Telas)

- **LoginScreen.js**: Tela de autenticação
- **CadastroScreen.js**: Tela de registro de novos usuários
- **HomeScreen.js**: Dashboard com cards e estatísticas
- **ReceitaScreen.js**: CRUD completo de receitas
- **DespesaScreen.js**: CRUD completo de despesas
- **ContasScreen.js**: CRUD completo de contas
- **ConfiguracoesScreen.js**: Configurações e perfil do usuário

### Utilitários

- **src/utils/formatters.js**:
  - `formatarValor()`: Formata valores em R$
  - `formatarData()`: Formata datas em pt-BR
  - `formatarDataInput()`: Formata data para input
  - `gerarOpcoesMeses()`: Gera lista dos últimos 12 meses

### Tema

- **src/theme/theme.js**:
  - Define cores do app
  - Tema do React Native Paper
  - Cores consistentes com o sistema web

## 🔄 Fluxo de Navegação

```
Login/Cadastro
    ↓
Home (Dashboard)
    ↓
┌───┴───┬─────────┬───────────┬──────────────┐
│       │         │           │              │
Receitas Despesas Contas Configuracoes
```

## 🔐 Fluxo de Autenticação

1. Usuário faz login/cadastro
2. Credenciais são validadas na API
3. Dados do usuário são salvos no Secure Store
4. AuthContext atualiza o estado
5. Navegação redireciona para Home
6. Todas as telas acessam userId via AuthContext

## 📡 Comunicação com API

Todas as telas usam `axios` para comunicação:
- GET: Buscar dados
- POST: Criar novos registros
- PUT: Atualizar registros
- DELETE: Excluir registros

Endpoints configurados em `src/config/api.js` seguem o mesmo padrão do sistema web.

## 🎨 Sistema de Design

- **Cores**: Definidas em `src/theme/theme.js`
- **Componentes**: React Native Paper para UI consistente
- **Ícones**: Expo Vector Icons (Ionicons)
- **Navegação**: React Navigation (Stack + Tabs)

## 📦 Dependências Principais

- `expo`: Framework React Native
- `@react-navigation/native`: Navegação
- `react-native-paper`: Componentes UI
- `axios`: Cliente HTTP
- `expo-secure-store`: Armazenamento seguro

## 🚀 Próximas Melhorias

1. Gráficos e visualizações
2. Notificações push
3. Modo offline
4. Sincronização automática
5. Relatórios PDF
6. Exportação de dados

