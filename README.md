# FinFlow Mobile App

📱 **App móvel do FinFlow - Controle Financeiro**

## 🚀 Sobre o Projeto

O FinFlow Mobile é o aplicativo móvel oficial do sistema FinFlow, permitindo que os usuários controlem suas finanças de forma simples e eficiente diretamente no smartphone.

## ✨ Funcionalidades

- 📊 **Dashboard Intuitivo** - Visualize suas finanças em tempo real
- 💰 **Controle de Receitas e Despesas** - Cadastre e gerencie suas transações
- 📈 **Relatórios Detalhados** - Gráficos e análises completas
- 🔔 **Notificações Push** - Lembretes de vencimentos e alertas
- 🔐 **Segurança Avançada** - Biometria e autenticação segura
- 📱 **Sincronização** - Dados sincronizados com a versão web
- 🌙 **Modo Escuro** - Interface adaptável ao seu gosto

## 🛠️ Tecnologias

- **React Native** - Framework principal
- **TypeScript** - Tipagem estática
- **React Navigation** - Navegação entre telas
- **Axios** - Requisições HTTP
- **React Native Chart Kit** - Gráficos e visualizações
- **React Native Vector Icons** - Ícones
- **AsyncStorage** - Armazenamento local
- **React Native Biometrics** - Autenticação biométrica

## 📱 Requisitos

- **Android**: API 21+ (Android 5.0+)
- **iOS**: iOS 12.0+
- **Node.js**: 16+
- **React Native CLI**

## 🚀 Instalação

### 1. Clone o repositório
```bash
git clone https://github.com/limassa/FinFlow-Mobile.git
cd finflow-mobile
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configuração do ambiente

#### Android
```bash
# Certifique-se de ter o Android Studio instalado
# Configure as variáveis de ambiente ANDROID_HOME e JAVA_HOME
npm run android
```

#### iOS
```bash
# Certifique-se de ter o Xcode instalado
cd ios && pod install && cd ..
npm run ios
```

## 🔧 Configuração

### Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
# API Configuration
API_BASE_URL=https://finflow-production.up.railway.app
API_TIMEOUT=10000

# App Configuration
APP_NAME=FinFlow
APP_VERSION=1.0.0

# Feature Flags
ENABLE_BIOMETRICS=true
ENABLE_PUSH_NOTIFICATIONS=true
ENABLE_OFFLINE_MODE=true
```

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
├── screens/            # Telas do aplicativo
├── navigation/         # Configuração de navegação
├── services/           # Serviços (API, storage, etc.)
├── hooks/              # Custom hooks
├── utils/              # Utilitários e helpers
├── types/              # Definições de tipos TypeScript
├── constants/          # Constantes do app
├── assets/             # Imagens, ícones, etc.
└── styles/             # Estilos globais
```

## 🎨 Design System

O app segue o design system do FinFlow com:
- **Cores**: Gradientes azuis e roxos
- **Tipografia**: Roboto (Android) / SF Pro (iOS)
- **Ícones**: Material Design Icons
- **Componentes**: Consistentes com a versão web

## 🔐 Segurança

- **Autenticação biométrica** (Touch ID / Face ID)
- **Criptografia local** de dados sensíveis
- **Tokens JWT** para autenticação
- **Validação de entrada** em todos os formulários

## 📊 Performance

- **Lazy loading** de componentes
- **Memoização** de componentes pesados
- **Otimização de imagens**
- **Cache inteligente** de dados

## 🧪 Testes

```bash
# Executar testes
npm test

# Executar testes com coverage
npm run test:coverage

# Executar linting
npm run lint
```

## 📦 Build

### Android
```bash
# Build de desenvolvimento
npm run android

# Build de produção
npm run build:android
```

### iOS
```bash
# Build de desenvolvimento
npm run ios

# Build de produção
npm run build:ios
```

## 🚀 Deploy

### Google Play Store
1. Gere o APK/AAB de release
2. Configure o Google Play Console
3. Faça upload do arquivo
4. Configure as informações do app

### Apple App Store
1. Gere o IPA de release
2. Configure o App Store Connect
3. Faça upload via Xcode
4. Configure as informações do app

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

- **Email**: contatoLizSoftware@gmail.com
- **Website**: https://finflow.lizsoftware.com.br
- **Documentação**: [Wiki do projeto](https://github.com/limassa/FinFlow-Mobile/wiki)

## 🙏 Agradecimentos

- **React Native Community** - Framework incrível
- **Expo** - Ferramentas de desenvolvimento
- **Nossos usuários** - Feedback e suporte

---

**Desenvolvido com ❤️ pela Liz Softwares** 