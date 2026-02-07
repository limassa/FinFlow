# Migração FinFlow → Claricash

Este documento descreve o que foi alterado e o que você precisa fazer no servidor/DNS para concluir a mudança de nome do sistema para **Claricash**.

---

## 1. O que foi alterado no código

### Frontend (web)
- **public/index.html**: título e meta description → Claricash
- **public/manifest.json**: short_name e name → Claricash
- **src/components/Header.js**: título do app → Claricash (e id do gradient)
- **src/components/AuthBanner.js**: título e texto → Claricash
- **src/pages/Cadastro.js**: subtítulo → Claricash
- **src/pages/PrivacyPolicy.js**: todas as menções ao nome → Claricash
- **src/pages/Configuracoes.js**: nome do arquivo de exportação → claricash-dados-...
- **src/components/RelatorioPDF.js**: títulos dos PDFs → Claricash
- **src/utils/formatters.js**: prefixo dos PDFs → Claricash_

### Backend
- **backend/src/services/emailService.js**: fallback FRONTEND_URL e textos de email → claricash.com.br / Claricash
- **backend/config.production.js** e **config-email-producao.js**: fallback FRONTEND_URL → https://claricash.com.br

### Mobile (app)
- **app.json**: name → Claricash (slug e package mantidos para não quebrar lojas)
- Telas que exibem o nome (ex.: ForgotPasswordScreen, Sobre) → Claricash

### Configurações / deploy
- **railway.toml**, **railway.json**, **render.yaml**: FRONTEND_URL padrão → https://claricash.com.br
- **netlify.toml**: sem mudança de URL na build (use variáveis de ambiente no Netlify)
- **package.json** (raiz e mobile): name pode permanecer finflow/finflow-mobile para o repositório; o nome exibido é Claricash

---

## 2. O que você precisa fazer (servidor / DNS / Netlify)

### 2.1 Domínio Claricash

1. **Registro.br (ou seu registrador)**  
   - Registrar ou apontar o domínio **claricash.com.br** para o destino do front (ex.: Netlify), conforme instruções do registrador (registro de domínio ou alteração de DNS).

2. **Netlify**  
   - Em **Domain management** → **Add domain** → **Add custom domain**: `claricash.com.br`.  
   - Definir **claricash.com.br** como domínio principal do site.

### 2.2 Redirecionar FinFlow → Claricash (quem já acessa o link antigo)

1. **Netlify**  
   - Em **Domain management**, adicionar o domínio **finflow.lizsoftware.com.br** (se ainda não estiver).  
   - Em **Options** ao lado de **finflow.lizsoftware.com.br**, escolher **Redirect to**:  
     `https://claricash.com.br`  
   - Tipo **301 (Permanent)** para que buscadores e usuários passem a usar o novo endereço.

Assim, quem acessar **https://finflow.lizsoftware.com.br** (ou qualquer path, ex.: finflow.lizsoftware.com.br/login) será redirecionado para **https://claricash.com.br** (e o path mantido, conforme configuração do Netlify).

### 2.3 Variáveis de ambiente

- **Netlify** (frontend):  
  - `REACT_APP_API_URL`: manter a URL da API (ex.: Railway).  
  - Nenhuma variável precisa ter “FinFlow” no nome; o nome exibido é Claricash.

- **Railway** (backend):  
  - **FRONTEND_URL** = `https://claricash.com.br`  
  - Assim, links em emails (cadastro, redefinição de senha, etc.) apontam para o novo domínio.

Atualize **FRONTEND_URL** no Railway e faça um redeploy do backend após configurar o domínio Claricash.

---

## 3. Resumo

| Onde            | O que fazer |
|-----------------|-------------|
| **DNS**         | Domínio claricash.com.br apontando para o site (ex.: Netlify). |
| **Netlify**     | Adicionar claricash.com.br; configurar redirect de finflow.lizsoftware.com.br → https://claricash.com.br (301). |
| **Railway**     | FRONTEND_URL = https://claricash.com.br e redeploy. |
| **App (mobile)**| Nome exibido já é Claricash; package/bundle id podem permanecer para não criar nova ficha na loja. |

---

## 4. Observações

- **Package name do app** (com.lizsoftwares.finflow): foi mantido para evitar criar nova entrada na Play Store. Se no futuro quiser publicar como “Claricash” com package novo (ex.: com.lizsoftwares.claricash), será necessário novo app na loja.
- **Scripts em /scripts** e **documentação** que ainda citam “FinFlow” ou “finflow” em exemplos/URLs podem ser atualizados aos poucos; o importante para o usuário é o nome Claricash e o redirect do domínio antigo para o novo.
