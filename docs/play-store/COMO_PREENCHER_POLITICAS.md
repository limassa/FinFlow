# 📋 Como Preencher Políticas do App - FinFlow

Guia completo para preencher todas as seções de "Política do app" no Google Play Console.

---

## 🎯 Respostas para cada seção

### **1. Definir Política de Privacidade** ✅ OBRIGATÓRIO

**O que é:**
- URL da sua política de privacidade
- Deve estar acessível publicamente
- Deve explicar como você coleta, usa e protege dados

**O que preencher:**

**URL da Política de Privacidade:**
```
https://finflow.lizsoftware.com.br/privacy-policy
```

**OU:**
```
https://seu-dominio.com/privacy-policy
```

**Se não tiver ainda, crie uma página simples com:**

```html
Política de Privacidade - FinFlow

1. Coleta de Dados
O FinFlow coleta apenas os dados financeiros que você insere no aplicativo, 
como receitas, despesas e contas. Não coletamos informações pessoais sensíveis 
além dos dados necessários para o funcionamento do app.

2. Uso dos Dados
Os dados são usados apenas para:
- Permitir que você gerencie suas finanças
- Gerar relatórios e gráficos
- Enviar lembretes de vencimentos (se configurado)
- Melhorar a experiência do usuário

3. Segurança
Seus dados são armazenados de forma segura e criptografada. Utilizamos medidas 
de segurança adequadas para proteger suas informações.

4. Compartilhamento
Não compartilhamos seus dados com terceiros. Seus dados financeiros são privados 
e só você tem acesso.

5. Seus Direitos
Você pode excluir seus dados a qualquer momento através do aplicativo ou 
entrando em contato conosco.

6. Contato
Para dúvidas sobre privacidade, entre em contato: contatoLizSoftware@gmail.com

Última atualização: Janeiro 2026
```

**Status:** ⚠️ **Obrigatório** - Precisa ter URL válida

---

### **2. Acesso de apps** ✅ OBRIGATÓRIO

**O que é:**
- Declarar quais permissões seu app solicita
- Explicar por que precisa de cada permissão

**O que preencher:**

**Permissões que o FinFlow usa:**

#### **Internet:**
- ✅ **Usa:** Sim
- **Por quê:** Para sincronizar dados com o servidor backend

#### **Armazenamento:**
- ✅ **Usa:** Sim (armazenamento local)
- **Por quê:** Para salvar dados offline e cache

#### **Nenhuma outra permissão especial:**
- ❌ Câmera: Não usa
- ❌ Localização: Não usa
- ❌ Microfone: Não usa
- ❌ Contatos: Não usa
- ❌ Calendário: Não usa
- ❌ SMS: Não usa

**Declaração padrão:**
```
O FinFlow solicita acesso à Internet para sincronizar seus dados financeiros 
com o servidor, permitindo que você acesse suas informações de qualquer dispositivo. 
O app também utiliza armazenamento local para funcionar offline e melhorar o desempenho.

Não solicitamos acesso a câmera, localização, contatos ou outras permissões sensíveis.
```

**Status:** ⚠️ **Obrigatório** - Preencha declarando uso de Internet

---

### **3. Anúncios** ❌ NÃO SE APLICA

**O que é:**
- Declarar se o app mostra anúncios
- Identificar provedores de anúncios

**O que preencher:**

**Seu app mostra anúncios?**
```
❌ NÃO
```

**Motivo:**
- O FinFlow é gratuito SEM anúncios
- Não tem publicidade
- Não usa provedores de anúncios (Google Ads, AdMob, etc.)

**Se perguntar sobre provedores de anúncios:**
- Não se aplica (app não tem anúncios)

**Status:** ✅ Pode pular ou marcar "Não tem anúncios"

---

### **4. Classificação de conteúdo** ✅ JÁ CONCLUÍDO

**O que é:**
- Questionário sobre conteúdo do app
- Você já preencheu!

**Status:** ✅ **Já concluído** - Todas as respostas = NÃO

**Resultado:** "Todos os Outros Tipos de Aplicações"

---

### **5. Público-alvo** ⚠️ PRECISA PREENCHER

**O que é:**
- Declarar se o app é direcionado a crianças
- Idade mínima do público-alvo

**O que preencher:**

**Seu app é direcionado principalmente a crianças?**
```
❌ NÃO
```

**Público-alvo:**
```
A partir de 13 anos (ou "Todas as idades")
```

**OU:**
```
Todas as idades (o app é seguro para qualquer idade)
```

**Motivo:**
- FinFlow é um app de gestão financeira
- Qualquer pessoa pode usar, mas é mais voltado para adultos
- Não é um app educacional para crianças
- Não coleta dados de crianças

**Declaração sugerida:**
```
O FinFlow não é direcionado principalmente a crianças. Embora seja seguro para 
todas as idades, o app é voltado para pessoas que desejam gerenciar suas finanças 
pessoais. Não coletamos informações de crianças menores de 13 anos.
```

**Status:** ⚠️ **Obrigatório** - Responda: NÃO é direcionado a crianças

---

### **6. Segurança dos dados** ⚠️ PRECISA PREENCHER

**O que é:**
- Declarar como você coleta e protege dados
- Tipo de dados coletados

**O que preencher:**

**Tipos de dados coletados:**

#### **Dados financeiros:**
- ✅ Coletamos dados financeiros (receitas, despesas, contas)
- **Finalidade:** Funcionalidade do app (gerenciar finanças)
- **Coletado de:** Dados inseridos pelo usuário
- **Compartilhado com terceiros:** ❌ NÃO

#### **Dados de conta:**
- ✅ Email (para login e notificações)
- ✅ Nome (para personalização)
- ✅ Telefone (opcional, para WhatsApp)
- **Finalidade:** Autenticação e comunicação
- **Compartilhado com terceiros:** ❌ NÃO

#### **Dados que NÃO coletamos:**
- ❌ Localização
- ❌ Contatos
- ❌ Fotos/Câmera
- ❌ Dados de saúde
- ❌ Informações de pagamento (cartão de crédito, etc.)

**Declaração de segurança:**
```
Segurança dos Dados:

1. Coleta de Dados:
- Dados financeiros inseridos pelo usuário (receitas, despesas, contas)
- Informações de conta (email, nome, telefone opcional)

2. Uso dos Dados:
- Apenas para funcionalidade do app
- Para enviar notificações (se configurado)

3. Proteção:
- Dados armazenados de forma segura e criptografada
- Conexões seguras (HTTPS)

4. Compartilhamento:
- Não compartilhamos dados com terceiros
- Dados são privados do usuário
```

**Status:** ⚠️ **Obrigatório** - Preencha declarando coleta mínima de dados

---

### **7. Apps governamentais** ❌ NÃO SE APLICA

**O que é:**
- Declarar se é um app governamental

**O que preencher:**

**Seu app é governamental?**
```
❌ NÃO
```

**Motivo:**
- FinFlow é um app privado/comercial
- Não é desenvolvido ou gerenciado por governo

**Status:** ✅ Pode pular ou marcar "Não é governamental"

---

### **8. Recursos financeiros** ⚠️ PRECISA PREENCHER

**O que é:**
- Declarar funcionalidades financeiras do app
- Verificar se precisa de licenças bancárias

**O que preencher:**

**Seu app oferece recursos financeiros?**
```
✅ SIM (Ferramenta de gestão financeira pessoal)
```

**Tipo de recursos:**
- ✅ **Ferramenta de gestão financeira pessoal** (como planilha de gastos)
- ❌ **Não é** um serviço de pagamento
- ❌ **Não oferece** empréstimos ou crédito
- ❌ **Não processa** pagamentos
- ❌ **Não é** um banco ou instituição financeira
- ❌ **Não requer** licença bancária

**Declaração sugerida:**
```
O FinFlow é uma ferramenta de gestão financeira pessoal que permite ao usuário 
organizar e acompanhar suas receitas e despesas. É similar a uma planilha de 
controle financeiro.

O app NÃO oferece:
- Serviços de pagamento
- Empréstimos ou crédito
- Processamento de transações financeiras
- Serviços bancários

O app apenas ajuda o usuário a organizar suas próprias informações financeiras.
```

**Status:** ⚠️ **Importante** - Declare que é ferramenta de gestão, não serviço financeiro

---

### **9. Saúde** ❌ NÃO SE APLICA

**O que é:**
- Declarar se o app lida com dados de saúde

**O que preencher:**

**Seu app coleta dados de saúde?**
```
❌ NÃO
```

**Motivo:**
- FinFlow é um app de finanças
- Não coleta dados de saúde
- Não tem funcionalidades relacionadas a saúde

**Status:** ✅ Pode pular ou marcar "Não coleta dados de saúde"

---

## ✅ Checklist Completo

Marque conforme for preenchendo:

**Políticas Obrigatórias:**
- [ ] **Política de Privacidade:** URL preenchida
- [ ] **Acesso de apps:** Declaração de permissões
- [ ] **Público-alvo:** Declarado que não é para crianças
- [ ] **Segurança dos dados:** Tipo de dados declarado

**Políticas Importantes:**
- [ ] **Recursos financeiros:** Declarado como ferramenta de gestão

**Políticas Não Aplicáveis:**
- [ ] **Anúncios:** Marcar "Não tem anúncios"
- [ ] **Classificação de conteúdo:** ✅ Já concluído
- [ ] **Apps governamentais:** Marcar "Não é governamental"
- [ ] **Saúde:** Marcar "Não coleta dados de saúde"

---

## 📝 Ordem de Preenchimento Recomendada

1. ✅ **Política de Privacidade** (criar página primeiro)
2. ✅ **Acesso de apps** (declarar Internet)
3. ✅ **Público-alvo** (NÃO é para crianças)
4. ✅ **Segurança dos dados** (declarar coleta mínima)
5. ✅ **Recursos financeiros** (ferramenta de gestão)
6. ✅ **Anúncios** (NÃO tem)
7. ✅ **Classificação** (já feito)
8. ✅ **Apps governamentais** (NÃO é)
9. ✅ **Saúde** (NÃO coleta)

---

## 🎯 Resumo Rápido

**O que precisa preencher:**
- ✅ Política de Privacidade (URL)
- ✅ Acesso de apps (Internet)
- ✅ Público-alvo (NÃO para crianças)
- ✅ Segurança dos dados (coleta mínima)
- ✅ Recursos financeiros (ferramenta de gestão)

**O que pode marcar "Não se aplica":**
- ❌ Anúncios
- ❌ Apps governamentais
- ❌ Saúde

**O que já está pronto:**
- ✅ Classificação de conteúdo

---

## ⚠️ Importante

1. **Política de Privacidade:** Deve ser uma URL pública válida
2. **Recursos financeiros:** Deixe claro que é ferramenta, não serviço bancário
3. **Público-alvo:** Responda "NÃO" para direcionado a crianças
4. **Seja honesto:** Declare apenas o que o app realmente faz

---

**Pronto!** Use este guia para preencher todas as políticas do app.

