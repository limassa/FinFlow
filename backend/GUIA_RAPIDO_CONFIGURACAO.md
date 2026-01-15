# ⚡ Guia Rápido de Configuração

## 🎯 Evolution API Está Rodando!

Agora você precisa:

### 1️⃣ Acessar Interface Web

```
http://localhost:8082
```

### 2️⃣ Criar Instância

- Nome: `webcond`
- Tipo: WhatsApp
- Clique em "Create"

### 3️⃣ Escanear QR Code

- WhatsApp → Configurações → Aparelhos conectados
- Vincular dispositivo
- Escanear QR Code na tela

### 4️⃣ Verificar

Execute:
```powershell
cd backend
node scripts/testar-evolution-api.js
```

Deve mostrar: ✅ Instância conectada!

### 5️⃣ Testar

No app mobile:
1. Ative "Receber lembretes por WhatsApp"
2. Preencha telefone no perfil
3. Crie despesa com vencimento próximo
4. Teste envio via API

## ✅ Pronto!

Veja o guia completo em: `CONFIGURAR_EVOLUTION_API_COMPLETO.md`

