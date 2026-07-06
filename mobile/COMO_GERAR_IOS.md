# Como gerar e publicar na App Store (iOS)

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

> **Obrigatório desde abril/2026:** builds iOS devem usar **Xcode 26** (iOS 26 SDK).
> O projeto usa **Expo SDK 54** com imagem `sdk-54` no `eas.json`.

```powershell
cd mobile
eas build --platform ios --profile production
```

Na **primeira vez**, escolha:
- **Let EAS handle credentials** (recomendado)
- Informe Apple ID da conta Developer
- Confirme autenticação em 2 fatores se solicitado

O build leva ~15–30 minutos. Acompanhe em:
https://expo.dev/accounts/limassa/projects/finflow-mobile/builds

## 3. Enviar para App Store Connect

Após o build concluir:

```powershell
eas submit --platform ios --profile production
```

Ou build + submit de uma vez:

```powershell
eas build --platform ios --profile production --auto-submit
```

## 4. Preencher no App Store Connect

| Campo | Valor |
|-------|-------|
| Política de privacidade | `https://claricash.com.br/privacy-policy` |
| Categoria | Finanças |
| Preço | Grátis |
| Export compliance | Usa criptografia padrão (HTTPS) — **No** para criptografia customizada |

## 5. TestFlight (recomendado)

1. App Store Connect → **TestFlight**
2. Aguarde processamento do build (30 min – 2 h)
3. Adicione testadores internos
4. Teste no iPhone antes de enviar para revisão

## 6. Enviar para revisão

1. **App Store** → versão → selecione o build
2. Preencha screenshots (iPhone 6.7": 1290×2796)
3. **Enviar para revisão**

## Comandos úteis

```powershell
eas build:list --platform ios
eas submit:list --platform ios
```

## Observações

- **Não precisa de Mac** — o EAS compila na nuvem
- Bundle ID: `com.lizsoftwares.finflow`
- Versão atual: `1.0.0` (build number incrementado automaticamente pelo EAS)
