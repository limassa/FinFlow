# Como gerar e publicar na App Store (iOS)

> **Manual completo de produção (recomendado):**  
> [`COMO_PUBLICAR_IOS_PRODUCAO.md`](./COMO_PUBLICAR_IOS_PRODUCAO.md)  
> Passo a passo: build → TestFlight → revisão → liberar na App Store.

## Pré-requisitos

- Conta Apple Developer ativa ($99/ano)
- Login no EAS: `eas login` (conta: **limassa**)
- App criado no [App Store Connect](https://appstoreconnect.apple.com) com Bundle ID `com.lizsoftwares.finflow`

## 1. Criar app no App Store Connect (se ainda não fez)

1. **Meus Apps** → **+** → **Novo App**
2. Plataforma: **iOS**
3. Nome: **Claricash**
4. Idioma: **Português (Brasil)**
5. Bundle ID: **com.lizsoftwares.finflow**
6. SKU: **finflow-mobile-001**

## 2. Gerar build de produção (EAS)

> O projeto usa **Expo SDK 54** com imagem `sdk-54` no `eas.json`.

```powershell
cd mobile
npx eas-cli build --platform ios --profile production --auto-submit --non-interactive
```

Na **primeira vez** (modo interativo), escolha:
- **Let EAS handle credentials** (recomendado)
- Informe Apple ID da conta Developer (`moreira.joaoneto@icloud.com`)
- Confirme autenticação em 2 fatores se solicitado

O build leva ~15–40 minutos. Acompanhe em:
https://expo.dev/accounts/limassa/projects/finflow-mobile/builds

## 3. Enviar para App Store Connect

Com `--auto-submit` o envio já é feito. Sem isso, após o build:

```powershell
npx eas-cli submit --platform ios --profile production --latest --non-interactive
```

## 4. TestFlight → Produção

Siga o manual: [`COMO_PUBLICAR_IOS_PRODUCAO.md`](./COMO_PUBLICAR_IOS_PRODUCAO.md)  
(resumo: processar build → testar → selecionar na versão → enviar para revisão → liberar)

## Comandos úteis

```powershell
npx eas-cli build:list --platform ios
npx eas-cli submit:list --platform ios
```

## Observações

- **Não precisa de Mac** — o EAS compila na nuvem
- Bundle ID: `com.lizsoftwares.finflow`
- ASC App ID: `6787544258`
- Build number incrementado automaticamente pelo EAS (`autoIncrement`)
