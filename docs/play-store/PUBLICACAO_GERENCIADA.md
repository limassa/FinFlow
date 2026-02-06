# 📤 Publicação gerenciada (Managed publishing)

Explicação da opção **Publicação gerenciada** no Google Play Console e o que significa cada modo.

---

## O que é Publicação gerenciada?

É a configuração que define **quando** suas alterações entram no ar na Play Store depois que o Google aprova:

| Modo | Comportamento |
|------|----------------|
| **Ativada** | Após a aprovação do Google, as mudanças **ficam em espera**. Você escolhe o momento de publicar (um botão “Publicar” fica disponível). |
| **Desativada** | Após a aprovação do Google, as mudanças **são publicadas automaticamente** na loja. |

---

## Mensagem que você viu

- **"Publicação gerenciada"** = Nome da opção no Play Console.
- **"Publicação gerenciada desativada"** = O modo automático está ligado.
- **"Se você enviar essas mudanças ao Google para revisão, elas vão ser publicadas automaticamente após a aprovação"** = Com a publicação gerenciada **desativada**, assim que o Google aprovar, a versão/alterações vão ao ar sozinhas, sem precisar clicar em “Publicar”.

Resumo: com **publicação gerenciada desativada**, o fluxo é: **enviar para revisão → Google aprova → app/atualização publicada automaticamente**.

---

## Onde fica a configuração

1. Abra o **Google Play Console** e selecione o app.
2. No menu, vá em **"Testar e Lançar"** (ou **"Produção"** / **"Versões"**).
3. Na tela de envio para produção, procure por **"Publicação gerenciada"** ou **"Managed publishing"** (pode estar no topo da página ou em configurações da trilha de produção).
4. Ative ou desative conforme desejado.

A localização exata pode variar conforme a versão do Console; se não achar, use a busca do próprio Console por “publicação gerenciada” ou “managed publishing”.

---

## Quando usar cada modo

### Use **Publicação gerenciada DESATIVADA** (publicação automática) quando:

- Você quer que atualizações e novas versões entrem no ar assim que forem aprovadas.
- Não precisa coordenar com data/hora específica nem com outras equipes.
- É o cenário mais comum para apps já em produção com atualizações normais.

### Use **Publicação gerenciada ATIVADA** quando:

- Quer controlar o dia e a hora em que a versão vai ao ar (lançamento programado, campanhas, etc.).
- Quer revisar o status “aprovado” antes de expor para usuários.
- Precisa alinhar a publicação com marketing, suporte ou outros times.

---

## Resumo rápido

| Situação | Publicação gerenciada |
|----------|------------------------|
| Publicar assim que o Google aprovar | **Desativada** |
| Só publicar quando você clicar em “Publicar” | **Ativada** |

A mensagem **"Se você enviar essas mudanças ao Google para revisão, elas vão ser publicadas automaticamente após a aprovação"** aparece quando a publicação gerenciada está **desativada** e descreve exatamente esse comportamento.
