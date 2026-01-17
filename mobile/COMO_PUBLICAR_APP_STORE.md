# 🍎 Como Publicar na Apple App Store

## 📋 Pré-requisitos

- ✅ Conta Apple Developer ($99 USD/ano)
- ✅ Mac com Xcode instalado (obrigatório)
- ✅ iOS App gerado (.ipa)
- ✅ Ícone do app (1024x1024px)
- ✅ Screenshots do app (vários tamanhos)
- ✅ Descrição do app
- ✅ Política de privacidade (URL)
- ✅ App testado em dispositivo iOS real

---

## 🚀 Passo a Passo Completo

### **Passo 1: Criar Conta Apple Developer**

1. Acesse: https://developer.apple.com
2. Clique em **"Account"** → **"Enroll"**
3. Faça login com sua Apple ID
4. Escolha o tipo de conta:
   - **Individual:** $99 USD/ano
   - **Organization:** $99 USD/ano
5. Complete o cadastro e pague
6. Aguarde aprovação (pode levar alguns dias)

### **Passo 2: Instalar Xcode (no Mac)**

1. Abra a **App Store** no Mac
2. Pesquise **"Xcode"**
3. Clique em **"Obter"** ou **"Instalar"**
4. Aguarde instalação (pode demorar)

### **Passo 3: Configurar App no Xcode**

#### 3.1 Preparar Projeto

```bash
cd mobile
npx expo prebuild --platform ios
```

#### 3.2 Abrir no Xcode

```bash
open ios/*.xcworkspace
```

Ou abra manualmente: **Xcode** → **File** → **Open** → selecione `ios/` folder

### **Passo 4: Configurar Certificados e Provisioning**

#### 4.1 Configurar Bundle Identifier

1. No Xcode, selecione o projeto
2. Vá em **"Signing & Capabilities"**
3. Configure:
   - **Team:** Sua conta Apple Developer
   - **Bundle Identifier:** `com.lizsoftwares.finflow`
   - ✅ **Automatically manage signing**

#### 4.2 Configurar Certificados (Automático)

- O Xcode criará automaticamente os certificados necessários
- Certifique-se de estar logado com sua Apple ID

### **Passo 5: Configurar App Store Connect**

1. Acesse: https://appstoreconnect.apple.com
2. Faça login com sua Apple ID de desenvolvedor
3. Clique em **"My Apps"** → **"+"** → **"New App"**

#### 5.1 Informações Básicas

**Platform:**
```
iOS
```

**Name:**
```
FinFlow
```

**Primary Language:**
```
Portuguese (Brazil)
```

**Bundle ID:**
```
com.lizsoftwares.finflow
```

**SKU:**
```
finflow-mobile-001
```

**User Access:**
```
Full Access
```

Clique em **"Create"**

### **Passo 6: Preencher Informações do App**

#### 6.1 App Information

**Category:**
- **Primary:** Finance
- **Secondary:** (opcional) Productivity

**Privacy Policy URL:**
```
https://seu-dominio.com/privacy-policy
```

**Subtitle** (máx. 30 caracteres):
```
Controle Financeiro Simples
```

#### 6.2 Pricing and Availability

- **Price:** Free (ou configure preço)
- **Availability:** All countries (ou selecione países)

### **Passo 7: Configurar Versão 1.0**

#### 7.1 App Store Listing

**Name** (máx. 30 caracteres):
```
FinFlow
```

**Subtitle** (máx. 30 caracteres):
```
Controle Financeiro
```

**Description** (máx. 4000 caracteres):
```
FinFlow é um aplicativo completo para controle financeiro pessoal, desenvolvido para ajudar você a gerenciar suas finanças de forma simples e eficiente.

🎯 RECURSOS PRINCIPAIS:

💰 Gestão de Receitas e Despesas
- Cadastre suas receitas e despesas de forma rápida
- Organize por categorias personalizadas
- Acompanhe seu fluxo de caixa em tempo real

📊 Gráficos e Relatórios
- Visualize sua evolução financeira com gráficos interativos
- Analise seus gastos por categoria
- Acompanhe sua receita mensal

📅 Lembretes e Notificações
- Configure lembretes para contas a pagar
- Receba notificações por email e WhatsApp
- Nunca mais esqueça uma conta importante

📱 Calculadoras Financeiras
- Calculadora de juros compostos
- Calculadora de retiradas mensais
- Planeje seu futuro financeiro

🎨 Interface Moderna e Intuitiva
- Design limpo e fácil de usar
- Navegação simples e rápida
- Suporte a modo escuro

🔒 Seguro e Confiável
- Seus dados são criptografados
- Backup automático na nuvem
- Acesso rápido e seguro

O FinFlow é perfeito para quem quer:
- Ter controle total sobre suas finanças
- Economizar e alcançar objetivos financeiros
- Organizar receitas e despesas de forma simples
- Planejar o futuro financeiro

Baixe agora e comece a controlar suas finanças hoje mesmo!
```

**Keywords** (máx. 100 caracteres):
```
finanças, controle financeiro, receitas, despesas, orçamento, economia, dinheiro, contas, gráficos
```

**Promotional Text** (máx. 170 caracteres):
```
Gerencie suas finanças de forma simples e eficiente. Acompanhe receitas, despesas e alcance seus objetivos financeiros.
```

**Support URL:**
```
https://seu-dominio.com/support
```

**Marketing URL** (opcional):
```
https://seu-dominio.com
```

#### 7.2 Screenshots

**iPhone 6.7" Display (iPhone 14 Pro Max):**
- Mínimo: 2
- Recomendado: 4-8
- Tamanho: 1290 x 2796 pixels

**iPhone 6.5" Display (iPhone 11 Pro Max):**
- Mínimo: 2
- Recomendado: 4-8
- Tamanho: 1242 x 2688 pixels

**iPhone 5.5" Display (iPhone 8 Plus):**
- Mínimo: 2
- Recomendado: 4-8
- Tamanho: 1242 x 2208 pixels

**iPad Pro (3rd gen) 12.9":**
- Mínimo: 2
- Recomendado: 4-8
- Tamanho: 2048 x 2732 pixels

**iPad Pro (2nd gen) 12.9":**
- Mínimo: 2
- Recomendado: 4-8
- Tamanho: 2048 x 2732 pixels

**Como criar screenshots:**
1. No simulador iOS, use **Device** → **Screenshot**
2. Ou use dispositivo físico: **Power + Volume Up**
3. Edite para remover barras de status (opcional)
4. Redimensione conforme tamanhos acima

#### 7.3 Ícone do App

**App Icon:**
- Tamanho: 1024 x 1024 pixels
- Formato: PNG ou JPEG
- Sem transparência
- Sem bordas arredondadas (Apple adiciona automaticamente)

#### 7.4 App Preview (Vídeo - Opcional)

- Vídeo de 15-30 segundos
- Mostre os recursos principais do app
- Formatos aceitos: .mov, .m4v, .mp4

### **Passo 8: Configurar Build**

#### 8.1 Gerar Build no Xcode

1. No Xcode, selecione **"Any iOS Device"** ou dispositivo específico
2. Vá em **"Product"** → **"Archive"**
3. Aguarde o build concluir
4. A janela **"Organizer"** abrirá automaticamente

#### 8.2 Validar Build

1. Na janela **"Organizer"**, selecione o archive
2. Clique em **"Validate App"**
3. Siga as instruções
4. Aguarde validação

#### 8.3 Fazer Upload para App Store Connect

1. Na janela **"Organizer"**, selecione o archive
2. Clique em **"Distribute App"**
3. Selecione **"App Store Connect"**
4. Clique em **"Upload"**
5. Siga as instruções
6. Aguarde upload (pode demorar)

**Alternativa via Terminal:**
```bash
cd mobile
eas build --platform ios --profile production
```

### **Passo 9: Selecionar Build para Versão**

1. No App Store Connect, vá em **"TestFlight"**
2. Aguarde processamento do build (pode levar 30 min - 2 horas)
3. Vá em **"App Store"** → **"Versão 1.0"**
4. Na seção **"Build"**, clique em **"Select a build before you submit your app"**
5. Selecione o build processado
6. Clique em **"Done"**

### **Passo 10: Configurar Informações de Exportação**

#### 10.1 Export Compliance

**Does your app use encryption?**
- Se não usa criptografia avançada: **No**
- Se usa HTTPS: **Yes** → Selecione **"App uses standard encryption"**

#### 10.2 Content Rights

- Confirme que você tem direitos sobre todo o conteúdo
- Marque as declarações necessárias

#### 10.3 Advertising Identifier

- Declare se usa identificador de publicidade
- Configure conforme necessário

### **Passo 11: Configurar TestFlight (Opcional mas Recomendado)**

#### 11.1 Criar Grupo de Testadores

1. Vá em **"TestFlight"**
2. Clique em **"Internal Testing"** ou **"External Testing"**
3. Crie grupo de testadores
4. Adicione emails (para Internal) ou configure link público (External)
5. Selecione build para teste
6. Envie convites

#### 11.2 Testar Antes de Publicar

- Teste o app por alguns dias
- Colete feedback
- Corrija problemas antes da publicação

### **Passo 12: Revisar e Enviar para Revisão**

#### 12.1 Checklist Final

Antes de enviar, verifique:

- [ ] Build processado e selecionado
- [ ] Screenshots em todos os tamanhos necessários
- [ ] Ícone 1024x1024px
- [ ] Descrição completa preenchida
- [ ] Keywords preenchidas
- [ ] Política de privacidade (URL)
- [ ] Categoria selecionada
- [ ] Preços configurados
- [ ] Países de distribuição selecionados
- [ ] Export compliance preenchido
- [ ] App testado em dispositivos reais

#### 12.2 Enviar para Revisão

1. No App Store Connect, vá em **"App Store"** → **"Versão 1.0"**
2. Revise todas as informações
3. Role até o final da página
4. Clique em **"Submit for Review"**
5. Responda perguntas finais:
   - Contato de suporte
   - Demos (se necessário)
   - Notas para revisores (opcional)
6. Clique em **"Submit"**

### **Passo 13: Acompanhar Status**

1. No App Store Connect, vá em **"My Apps"** → Seu app
2. Você verá o status:
   - **Waiting for Review:** Aguardando revisão
   - **In Review:** Em revisão (geralmente 24-48 horas)
   - **Pending Developer Release:** Aprovado, aguardando sua ação
   - **Ready for Sale:** Disponível na App Store
   - **Rejected:** Rejeitado, veja o motivo

### **Passo 14: Após Publicação**

1. **Compartilhar link:**
   ```
   https://apps.apple.com/app/id[SEU_APP_ID]
   ```
   (O ID será gerado após publicação)

2. **Monitorar métricas:**
   - Vá em **"Sales and Trends"**
   - Acompanhe downloads, vendas, etc.

3. **Atualizar app:**
   - Faça mudanças
   - Gere novo build
   - Crie nova versão no App Store Connect
   - Repita o processo

---

## 📝 Informações Importantes

### **Tempo de Revisão:**
- Primeira publicação: 1-3 dias
- Atualizações: Geralmente 24-48 horas
- Rejeições podem demorar mais

### **Taxa Apple Developer:**
- **$99 USD/ano**
- Pago anualmente

### **Requisitos:**
- **Mac obrigatório** para gerar build iOS
- Xcode instalado
- Dispositivo iOS real para testes completos

### **Links Úteis:**
- [Apple Developer](https://developer.apple.com)
- [App Store Connect](https://appstoreconnect.apple.com)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)

---

## ⚠️ Problemas Comuns

### **App Rejeitado**

**Motivos comuns:**
- Política de privacidade ausente ou incompleta
- Descrição não corresponde ao app
- Screenshots de baixa qualidade ou incorretos
- Problemas de usabilidade
- Violação de guidelines

**Solução:**
1. Veja o motivo da rejeição no App Store Connect
2. Corrija os problemas mencionados
3. Reenvie para revisão
4. Pode levar 24-48 horas para nova revisão

### **Erro no Upload**

**Problema:** Build não é aceito

**Solução:**
- Verifique certificados e provisioning profiles
- Certifique-se de que o Bundle ID está correto
- Valide o build antes de enviar
- Verifique se o versionCode foi incrementado

### **Build Não Aparece**

**Problema:** Build não aparece para seleção

**Solução:**
- Aguarde processamento (pode levar até 2 horas)
- Verifique se o Bundle ID corresponde
- Certifique-se de que o build foi validado

---

## ✅ Checklist Final

Antes de clicar em **"Submit for Review"**, confirme:

- [ ] Conta Apple Developer ativa
- [ ] Build gerado e processado
- [ ] Build selecionado na versão
- [ ] Screenshots em todos os tamanhos necessários
- [ ] Ícone 1024x1024px
- [ ] Descrição completa preenchida
- [ ] Keywords preenchidas
- [ ] Política de privacidade (URL)
- [ ] Categoria selecionada
- [ ] Export compliance preenchido
- [ ] Preços configurados
- [ ] Países de distribuição selecionados
- [ ] App testado em dispositivos reais
- [ ] TestFlight testado (recomendado)

---

## 🎉 Pronto!

Após seguir todos os passos, seu app estará na Apple App Store!

**Link do app:** (será gerado após publicação)
```
https://apps.apple.com/app/id[SEU_APP_ID]
```

---

## 💡 Dica Extra: Usar EAS Build (Recomendado)

Para simplificar o processo, você pode usar EAS Build:

```bash
cd mobile
eas build --platform ios --profile production
```

Isso gerará o build automaticamente e você poderá fazer upload direto para o App Store Connect, sem precisar do Xcode local (mas ainda precisa da conta Apple Developer).

