# 🚀 Lançar em produção (após testes)

Guia rápido para publicar o app na Play Store depois de ter testado (Teste Interno ou Teste Fechado).

---

## ⚠️ Produção ainda "Inativo"? (Requisito de teste fechado)

Se no Painel aparece **Produção → Inativo** e **"Solicitar o acesso de produção"**, o Google exige que você cumpra um **teste fechado** antes:

- **Pelo menos 12 testadores** que aceitaram participar do teste fechado  
- **Teste fechado ativo por pelo menos 14 dias**

Enquanto isso não for atendido, o botão de solicitar produção não é liberado. Passo a passo completo: **[Requisitos para acesso de produção](REQUISITOS_ACESSO_PRODUCAO.md)**.

---

## ✅ Pré-requisito (para seguir este guia)

- O acesso de produção já foi liberado (ou você não está nesse fluxo de primeira publicação), **e**
- Você já testou (Teste Interno ou Teste Fechado) e está satisfeito com o app.

---

## 📋 Passos para lançar em produção

### 1. Abrir Produção

1. Acesse o **Google Play Console**: https://play.google.com/console  
2. Selecione o app (FinFlow).  
3. No menu lateral: **Testar e Lançar** → **Produção**.

### 2. Criar a versão de produção

1. Clique em **"Criar versão"** ou **"Criar nova versão"**.  
2. **Se o mesmo AAB já está em teste:**  
   - Pode aparecer a opção de **promover** a versão do teste para produção (reutiliza o mesmo AAB).  
   - Use essa opção se quiser o mesmo binário que você testou.  
3. **Se for fazer upload novo:**  
   - Clique em **"Fazer upload"** e envie o arquivo **.aab** (o mesmo que usou no teste ou uma versão nova).  
   - Não é obrigatório gerar outro AAB; pode ser o mesmo do teste.

### 3. Notas da versão

Preencha as **Notas da versão** (obrigatório). Exemplo:

```
🎉 Versão 1.0.0 - Lançamento Inicial

✨ Recursos principais:
- Gestão completa de receitas e despesas
- Gráficos e relatórios financeiros
- Lembretes por email e WhatsApp
- Calculadoras financeiras
- Interface moderna e intuitiva

🔒 Segurança e privacidade garantidas
```

Depois clique em **"Salvar"**.

### 4. Revisar antes de enviar

Confira rapidamente:

- [ ] Store listing completo (descrição, screenshots, ícone)
- [ ] Política de privacidade (URL)
- [ ] Classificação de conteúdo concluída
- [ ] Preços e distribuição (países, gratuito/pago)
- [ ] AAB na versão de produção e notas da versão preenchidas

Se algo estiver pendente, o próprio Console costuma mostrar avisos na página.

### 5. Enviar para revisão

1. Na tela da versão de **Produção**, revise os resumos.  
2. Clique em **"Enviar para revisão"** (ou **"Enviar para revisão do Google"** / **"Publicar"**, conforme o texto no Console).  
3. Confirme se for pedido.

**Publicação gerenciada desativada:**  
Com a [publicação gerenciada desativada](PUBLICACAO_GERENCIADA.md), após o Google aprovar o app **será publicado automaticamente** na Play Store. Não é preciso clicar em “Publicar” de novo.

### 6. Depois de enviar

- **Tempo típico:** primeira publicação costuma levar de **1 a 7 dias** (atualizações costumam ser mais rápidas).  
- Acompanhe em **Painel** ou **Produção** → status (ex.: “Em revisão”, “Publicado”).  
- Se for **rejeitado**, o Console mostra o motivo e o que ajustar; corrija e envie de novo.

---

## 📌 Resumo em uma frase

**Testar e Lançar** → **Produção** → **Criar versão** (ou promover do teste) → preencher **Notas da versão** → **Enviar para revisão** → aguardar aprovação (1–7 dias).

---

## 🔗 Ver também

- [Publicação gerenciada](PUBLICACAO_GERENCIADA.md) – publicação automática após aprovação  
- [Estratégia de testes e publicação](ESTRATEGIA_TESTES_PUBLICACAO.md) – visão geral das trilhas (teste x produção)  
- [Como publicar na Play Store](COMO_PUBLICAR_PLAY_STORE.md) – fluxo completo desde o início
