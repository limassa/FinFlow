# 🔢 Solução: "O código de versão X já foi usado"

Guia para resolver o erro de `versionCode` duplicado no Play Console.

---

## ❌ Problema

Ao tentar fazer upload de um AAB no Play Console, aparece o erro:

```
O código de versão 13 já foi usado. Tente outro.
```

---

## ✅ Solução

### **Opção 1: Incrementar manualmente no build.gradle (Recomendado)**

1. **Abra o arquivo:** `mobile/android/app/build.gradle`

2. **Encontre a linha:**
   ```gradle
   versionCode 1
   ```

3. **Altere para um número maior que o último usado:**
   ```gradle
   versionCode 14  // Ou maior, dependendo do último usado
   ```

4. **Salve o arquivo**

5. **Gere um novo AAB:**
   ```bash
   cd mobile
   eas build --platform android --profile production
   ```

### **Opção 2: Configurar no eas.json**

1. **Abra o arquivo:** `mobile/eas.json`

2. **Adicione `versionCode` na configuração de produção:**
   ```json
   "production": {
     "autoIncrement": true,
     "android": {
       "buildType": "app-bundle",
       "versionCode": 14
     }
   }
   ```

3. **Gere um novo AAB:**
   ```bash
   cd mobile
   eas build --platform android --profile production
   ```

---

## 📋 Como descobrir o último versionCode usado

### **No Play Console:**
1. Vá em **"Teste"** → **"Teste fechado"** ou **"Teste interno"**
2. Veja as versões já enviadas
3. O `versionCode` aparece junto com o número da versão

### **No EAS Build:**
1. Acesse: https://expo.dev/accounts/[seu-usuario]/projects/finflow-mobile/builds
2. Veja os builds anteriores
3. O `versionCode` está nos detalhes do build

---

## ⚠️ Regras do versionCode

1. **Sempre deve ser maior** que o anterior
2. **Não pode ser reutilizado** (mesmo se deletar a versão)
3. **Deve ser um número inteiro** (1, 2, 3, ...)
4. **Não pode ser negativo**

---

## 🔄 Processo Completo

1. **Verifique o último `versionCode` usado** no Play Console
2. **Incremente para o próximo número** (ex: se último foi 13, use 14)
3. **Atualize o `build.gradle`** ou `eas.json`
4. **Gere um novo AAB** com EAS Build
5. **Faça upload no Play Console**

---

## 💡 Dica

Se você usar `"autoIncrement": true` no `eas.json`, o EAS Build tentará incrementar automaticamente, mas pode não funcionar corretamente se houver versões já enviadas manualmente. Nesse caso, defina o `versionCode` manualmente.

---

## ✅ Checklist

Antes de gerar o novo AAB:

- [ ] Verificado o último `versionCode` usado no Play Console
- [ ] Incrementado o `versionCode` no `build.gradle` ou `eas.json`
- [ ] Salvo as alterações
- [ ] Gerado novo AAB com EAS Build
- [ ] Verificado que o novo AAB tem `versionCode` correto

---

**Pronto para resolver o problema!** ✅

