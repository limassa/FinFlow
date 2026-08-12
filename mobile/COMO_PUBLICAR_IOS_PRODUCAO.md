# Manual — Publicar Claricash iOS em produção

Guia passo a passo para colocar (ou atualizar) o app na **App Store**.  
Não precisa de Mac: build e upload usam **EAS** + **App Store Connect**.

---

## Dados do projeto

| Item | Valor |
|------|--------|
| Nome | Claricash |
| Bundle ID | `com.lizsoftwares.finflow` |
| Apple ID (Developer) | `moreira.joaoneto@icloud.com` |
| Team ID | `46WWMAQDWV` |
| App Store Connect ID | `6787544258` |
| Conta EAS | `limassa` |
| Projeto EAS | https://expo.dev/accounts/limassa/projects/finflow-mobile |
| TestFlight | https://appstoreconnect.apple.com/apps/6787544258/testflight/ios |
| App Store Connect | https://appstoreconnect.apple.com/apps/6787544258 |
| Política de privacidade | `https://www.claricash.com.br/privacy-policy` |
| API produção | `https://www.claricash.com.br` |

Versão do app (`version`) e build number sobem automaticamente (`eas.json` → `autoIncrement` + `appVersionSource: remote`).

---

## Visão geral do fluxo

```
Código → Commit → EAS Build (iOS) → Submit → App Store Connect
                                              ↓
                                         Processamento Apple
                                              ↓
                                         TestFlight (teste)
                                              ↓
                                    Selecionar build na versão
                                              ↓
                                      Enviar para revisão
                                              ↓
                                    Aprovado → Produção (App Store)
```

---

## Parte A — Gerar e enviar o build (terminal)

### 1. Pré-requisitos

- Conta [Apple Developer](https://developer.apple.com/account) **Active**
- Logado no EAS: `eas login` (conta **limassa**)
- Alterações commitadas na branch `production` (recomendado)

```powershell
cd d:\Negocios\Projetos\Web\projeto-web\mobile
npx eas-cli whoami
```

### 2. Build + envio automático (recomendado)

```powershell
cd d:\Negocios\Projetos\Web\projeto-web\mobile
npx eas-cli build --platform ios --profile production --auto-submit --non-interactive
```

Isso:
1. Incrementa o **build number**
2. Compila o `.ipa` na nuvem (~15–40 min)
3. Envia para o App Store Connect
4. Agenda o processamento pela Apple

Acompanhe:  
https://expo.dev/accounts/limassa/projects/finflow-mobile/builds

### 3. Alternativa — build e submit separados

```powershell
# Só gerar
npx eas-cli build --platform ios --profile production --non-interactive

# Depois que o build terminar, enviar
npx eas-cli submit --platform ios --profile production --latest --non-interactive
```

### 4. Após o submit

1. Você recebe e-mail da Apple quando o processamento terminar (~5–30 min; às vezes mais).
2. O build aparece em **TestFlight**.
3. Teste no iPhone antes de mandar para produção.

---

## Parte B — TestFlight (teste interno)

1. Abra [TestFlight no App Store Connect](https://appstoreconnect.apple.com/apps/6787544258/testflight/ios)
2. Aguarde status **Pronto para enviar** / **Ready to Submit** (não “Processando”)
3. Se pedir **Export Compliance** / criptografia:
   - O app usa apenas HTTPS padrão
   - Responda que **não** usa criptografia proprietária / custom (conforme o formulário)
4. Adicione-se como testador interno e instale pelo app TestFlight
5. Valide login, Home, Receitas/Despesas e tema claro/escuro

---

## Parte C — Subir para produção (App Store)

### 1. Abrir a versão

1. [App Store Connect](https://appstoreconnect.apple.com/apps/6787544258) → **Claricash**
2. Aba **App Store** (distribuição)
3. Se for **atualização**: use a versão em preparação ou clique em **+ Versão**
4. Se for **primeira publicação**: complete a ficha do app (abaixo)

### 2. Associar o build

1. Em **Build**, clique em **+** / **Selecionar um build**
2. Escolha o build que acabou de processar (ex.: `1.0.4 (26)`)
3. Salve

### 3. Metadados obrigatórios (primeira vez ou se faltar)

| Campo | Sugestão |
|-------|----------|
| Nome | Claricash |
| Subtítulo | Controle financeiro pessoal |
| Categoria principal | Finanças |
| Preço | Grátis |
| Privacidade | URL: `https://www.claricash.com.br/privacy-policy` |
| Copyright | © Liz Software |
| Contato de suporte | e-mail da Liz Software |
| Classificação etária | Preencher questionário (finanças / sem conteúdo adulto) |

**Descrição curta (até 170 caracteres) — exemplo:**
> Organize receitas, despesas, cartões e orçamento. Claricash: finanças claras no iPhone.

**Descrição longa — exemplo:**
> O Claricash ajuda você a controlar suas finanças pessoais com clareza.
>
> • Receitas e despesas
> • Cartão de crédito
> • Calendário e agenda
> • Orçamento e categorias
> • Calculadoras financeiras
> • Resumo do mês na Home
>
> Disponível também na Web e no Android.
> Desenvolvido por Liz Software.

### 4. Capturas de tela (obrigatório)

Use **prints reais** do app (não mock genérico).

| Dispositivo | Resolução comum |
|-------------|-----------------|
| iPhone 6.7" (obrigatório na prática) | 1290 × 2796 |
| iPhone 6.5" (se pedir) | 1242 × 2688 |

Sugestão de 4–6 telas:
1. Home / Resumo do mês  
2. Receitas  
3. Despesas  
4. Calendário  
5. Cartão de crédito  
6. Orçamento ou Calculadoras  

### 5. Informações para revisão da Apple

Preencha o bloco **Informações da revisão do app**:

- Conta de demonstração (usuário + senha de teste), se o login for obrigatório
- Notas: “App de finanças pessoais; login necessário para ver dados”
- Contato: telefone/e-mail que a Apple possa usar

### 6. Enviar para revisão

1. Revise se build, textos e screenshots estão ok  
2. Clique em **Adicionar para revisão** / **Enviar para revisão**  
3. Confirme o questionário de exportação/criptografia se aparecer  
4. Status muda para **Em espera de revisão** → **Em revisão**

Prazo típico: **24–48 h** (pode variar).

### 7. Após aprovação — liberar em produção

Escolha uma opção na versão:

| Opção | Quando usar |
|-------|-------------|
| **Liberação automática** | Publica assim que a Apple aprovar |
| **Liberação manual** | Você clica em **Liberar esta versão** depois da aprovação |

Recomendado na primeira vez: **manual**, para conferir a página da loja antes de abrir ao público.

---

## Parte D — Checklist rápido (produção)

- [ ] Build iOS gerado com perfil `production`
- [ ] Submit concluído no EAS / App Store Connect
- [ ] Build processado no TestFlight
- [ ] Teste interno ok no iPhone
- [ ] Build selecionado na versão da App Store
- [ ] Screenshots reais atualizados
- [ ] Política de privacidade acessível
- [ ] Conta demo para revisão (se necessário)
- [ ] Enviado para revisão
- [ ] Aprovado e liberado (auto ou manual)

---

## Comandos úteis

```powershell
cd d:\Negocios\Projetos\Web\projeto-web\mobile

# Listar builds iOS
npx eas-cli build:list --platform ios --limit 5

# Listar envios
npx eas-cli submit:list --platform ios --limit 5

# Ver quem está logado
npx eas-cli whoami
```

---

## Problemas comuns

| Problema | O que fazer |
|----------|-------------|
| Build “Processando” por muito tempo | Esperar; se passar de ~2 h, ver e-mail da Apple / status no Connect |
| Rejeição por screenshots | Trocar por capturas reais do Claricash |
| Missing Compliance | Responder criptografia padrão (HTTPS) no TestFlight/App Store |
| Versão já usada | O EAS incrementa o build number; se precisar de nova `version` (1.0.5), altere em `app.json` ou no EAS remote |
| Credenciais Apple | Usar “Let EAS handle credentials”; Apple ID `moreira.joaoneto@icloud.com` |

---

## Relação com Android

- **iOS:** este manual (App Store Connect + TestFlight + revisão).  
- **Android:** AAB via EAS → upload manual no Play Console (auto-submit Android exige Google Service Account no EAS).

Build Android típico:

```powershell
npx eas-cli build --platform android --profile production --non-interactive
```

---

*Última atualização: ago/2026 — Expo SDK 54, EAS profile `production`, auto-submit iOS configurado.*
