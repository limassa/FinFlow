# 🔒 Criptografia em Trânsito - Play Store

Guia para responder sobre criptografia de dados em trânsito.

---

## 📋 Pergunta do Play Console

**"Os dados dos usuários coletados pelo app são criptografados em trânsito?"**

---

## ✅ Resposta para FinFlow

### **Resposta: SIM**

O FinFlow usa **HTTPS** para todas as comunicações com o servidor, garantindo que os dados sejam criptografados em trânsito.

---

## 🔐 Como Funciona

### **1. Protocolo HTTPS**

O app usa **HTTPS** (HTTP Secure) para todas as requisições:

- ✅ **URL de Produção:** `https://finflow-production-e4b3.up.railway.app`
- ✅ **Protocolo:** HTTPS (porta 443)
- ✅ **Criptografia:** TLS/SSL

### **2. Todas as Comunicações são Criptografadas**

Todas as requisições do app usam HTTPS:

- ✅ Login e autenticação
- ✅ Cadastro de usuário
- ✅ Envio de receitas e despesas
- ✅ Sincronização de dados
- ✅ Envio de formulários (Fale Conosco)
- ✅ Atualização de perfil
- ✅ Todas as outras operações

### **3. Certificado SSL**

O servidor Railway fornece certificado SSL válido:
- ✅ Certificado válido e confiável
- ✅ Renovação automática
- ✅ Compatível com todos os dispositivos Android

---

## 📝 Evidências Técnicas

### **Configuração da API:**

```javascript
// mobile/src/config/api.js
const API_BASE_URL = 'https://finflow-production-e4b3.up.railway.app';
```

**Nota:** A URL começa com `https://` (não `http://`), indicando uso de SSL/TLS.

### **Todas as Requisições:**

Todas as requisições do app usam HTTPS automaticamente:
- `axios.post()` - Usa HTTPS
- `axios.get()` - Usa HTTPS
- `axios.put()` - Usa HTTPS
- `axios.delete()` - Usa HTTPS

---

## ✅ Resumo

| Aspecto | Status |
|---------|--------|
| Protocolo usado | ✅ HTTPS |
| Criptografia | ✅ TLS/SSL |
| Certificado SSL | ✅ Válido (Railway) |
| Todas as requisições | ✅ Criptografadas |
| Dados em trânsito | ✅ Protegidos |

---

## 📋 Resposta no Play Console

**"Os dados dos usuários coletados pelo app são criptografados em trânsito?"**

**Resposta:** ✅ **SIM**

---

## 💡 Informações Adicionais (Opcional)

Se o Play Console pedir mais detalhes, você pode informar:

- **Protocolo:** HTTPS (TLS/SSL)
- **Porta:** 443 (padrão HTTPS)
- **Certificado:** Fornecido pelo Railway (válido e confiável)
- **Cobertura:** 100% das comunicações do app

---

**Pronto para preencher no Play Console!** ✅

