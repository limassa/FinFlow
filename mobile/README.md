# FinFlow Mobile App

Aplicativo móvel do sistema FinFlow - Controle Financeiro desenvolvido pela Liz Softwares.

## 📱 Sobre o App

O FinFlow Mobile é a versão mobile do sistema web, oferecendo todas as funcionalidades principais em uma interface otimizada para dispositivos móveis.

## ✨ Funcionalidades

- ✅ **Autenticação**: Login e cadastro de usuários
- ✅ **Dashboard**: Visão geral das finanças com cards informativos
- ✅ **Receitas**: Cadastro, edição, exclusão e filtros por mês
- ✅ **Despesas**: Cadastro, edição, exclusão e filtros por mês
- ✅ **Contas**: Gestão de contas bancárias e carteiras
- ✅ **Recorrência**: Suporte a receitas e despesas recorrentes
- ✅ **Filtros**: Filtro por mês para receitas e despesas
- ✅ **Configurações**: Perfil do usuário e configurações

## 🚀 Como Executar

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app no seu dispositivo móvel (iOS ou Android)

### Instalação

1. Navegue até a pasta do app:
```bash
cd mobile
```

2. Instale as dependências:
```bash
npm install
```

3. Configure a URL da API no arquivo `src/config/api.js`:
```javascript
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3001'  // Para desenvolvimento local
  : 'https://sua-api-producao.com'; // Para produção
```

**Nota**: Para testar em dispositivo físico, substitua `localhost` pelo IP da sua máquina na rede local (ex: `http://192.168.1.100:3001`).

4. Inicie o servidor de desenvolvimento:
```bash
npm start
```

5. Escaneie o QR code com o app Expo Go:
   - **iOS**: Use a câmera do iPhone
   - **Android**: Use o app Expo Go

## 📁 Estrutura do Projeto

```
mobile/
├── App.js                 # Componente principal e navegação
├── app.json              # Configuração do Expo
├── package.json          # Dependências do projeto
├── src/
│   ├── config/
│   │   └── api.js        # Configuração da API
│   ├── context/
│   │   └── AuthContext.js # Context de autenticação
│   ├── screens/
│   │   ├── LoginScreen.js
│   │   ├── CadastroScreen.js
│   │   ├── HomeScreen.js
│   │   ├── ReceitaScreen.js
│   │   ├── DespesaScreen.js
│   │   ├── ContasScreen.js
│   │   └── ConfiguracoesScreen.js
│   ├── theme/
│   │   └── theme.js      # Tema e cores
│   └── utils/
│       └── formatters.js # Funções de formatação
└── README.md
```

## 🎨 Design

O app mantém a mesma identidade visual do sistema web:
- **Cor primária**: #4a67af (Azul)
- **Cor secundária**: #2d7cf7 (Azul claro)
- **Sucesso**: #4caf50 (Verde)
- **Erro**: #f44336 (Vermelho)

## 🔧 Tecnologias Utilizadas

- **React Native**: Framework para desenvolvimento mobile
- **Expo**: Plataforma para desenvolvimento React Native
- **React Navigation**: Navegação entre telas
- **React Native Paper**: Componentes de UI
- **Axios**: Cliente HTTP
- **Expo Secure Store**: Armazenamento seguro de dados

## 📱 Compatibilidade

- **iOS**: 11.0 ou superior
- **Android**: 5.0 (API 21) ou superior

## 🔐 Segurança

- Credenciais de usuário armazenadas de forma segura usando Expo Secure Store
- Comunicação com API via HTTPS em produção
- Validação de dados no cliente e servidor

## 📝 Notas de Desenvolvimento

### Configuração da API

Para desenvolvimento local, você precisa:
1. Ter o backend rodando na porta 3001
2. Configurar a URL correta no arquivo `src/config/api.js`
3. Para dispositivos físicos, usar o IP da máquina ao invés de `localhost`

### Build para Produção

Para gerar builds de produção:

```bash
# Android
expo build:android

# iOS
expo build:ios
```

## 🤝 Contribuindo

Este é um projeto da Liz Softwares. Para sugestões ou problemas, entre em contato através do sistema web.

## 📄 Licença

MIT License - Liz Softwares

