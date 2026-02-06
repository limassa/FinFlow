# 🚀 Guia Rápido - FinFlow Mobile

## Início Rápido

### 1. Instalação
```bash
cd mobile
npm install
```

### 2. Configurar API
Edite `src/config/api.js` e configure a URL do backend:
```javascript
const API_BASE_URL = __DEV__ 
  ? 'http://SEU_IP_LOCAL:3001'  // Use o IP da sua máquina, não localhost
  : 'https://sua-api-producao.com';
```

**Importante**: Para testar em dispositivo físico, use o IP da sua máquina na rede local (ex: `192.168.1.100`).

### 3. Iniciar o App
```bash
npm start
```

### 4. Testar no Dispositivo
- **iOS**: Abra a câmera e escaneie o QR code
- **Android**: Abra o app Expo Go e escaneie o QR code

## 📱 Funcionalidades Implementadas

✅ **Autenticação**
- Login
- Cadastro
- Logout

✅ **Dashboard**
- Cards de receitas, despesas e saldo
- Resumo do mês
- Ações rápidas

✅ **Receitas**
- Listar receitas
- Adicionar receita
- Editar receita
- Excluir receita
- Marcar como recebida
- Filtro por mês
- Recorrência (mensal, semanal, quinzenal)

✅ **Despesas**
- Listar despesas
- Adicionar despesa
- Editar despesa
- Excluir despesa
- Marcar como paga
- Filtro por mês
- Data de vencimento
- Recorrência (mensal, semanal, quinzenal)

✅ **Contas**
- Listar contas
- Adicionar conta
- Editar conta
- Excluir conta
- Saldo inicial

✅ **Configurações**
- Perfil do usuário
- Logout

## 🔧 Solução de Problemas

### Erro de conexão com API
- Verifique se o backend está rodando
- Verifique se a URL está correta no `src/config/api.js`
- Para dispositivo físico, use o IP da máquina, não `localhost`

### App não carrega
- Verifique se todas as dependências foram instaladas: `npm install`
- Limpe o cache: `expo start -c`

### Erro de navegação
- Certifique-se de que todas as telas estão importadas corretamente
- Verifique se o AuthContext está configurado

## 📚 Próximos Passos

1. Adicionar gráficos (usando react-native-chart-kit)
2. Implementar notificações push
3. Adicionar modo offline
4. Implementar sincronização automática
5. Adicionar relatórios PDF

## 🎨 Personalização

### Cores
Edite `src/theme/theme.js` para alterar as cores do app.

### Navegação
Edite `App.js` para modificar a estrutura de navegação.

## 📞 Suporte

Para mais informações, consulte o README.md principal.

