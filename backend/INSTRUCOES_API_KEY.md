# 🔑 Instruções: Encontrar e Configurar API Key

## 🎯 Problema

Erro 401 (Unauthorized) - A API Key está incorreta.

## ✅ Solução Manual (Mais Rápido)

### Passo 1: Abrir Arquivo .env da Evolution API

Abra este arquivo em um editor de texto:
```
D:\Negocios\Projetos\Web\projeto-web\services\evolution-api\.env
```

### Passo 2: Encontrar a API Key

Procure pela linha:
```env
AUTHENTICATION_API_KEY=...
```

**Copie o valor completo** (sem aspas, se houver).

### Passo 3: Atualizar config.env

1. **Abra:**
   ```
   D:\Negocios\Projetos\Web\projeto-web\backend\config.env
   ```

2. **Encontre a linha:**
   ```env
   EVOLUTION_API_KEY=WebCond_2025_Evolution_API_Chave_Secreta_123!@#
   ```

3. **Substitua pelo valor copiado:**
   ```env
   EVOLUTION_API_KEY=valor-copiado-do-passo-2
   ```

4. **Salve o arquivo**

### Passo 4: Reiniciar Backend

**IMPORTANTE:** Reinicie o backend:

1. **Pare o backend** (Ctrl+C no terminal)
2. **Inicie novamente:**
   ```powershell
   cd D:\Negocios\Projetos\Web\projeto-web\backend
   npm start
   ```

### Passo 5: Testar

```powershell
cd backend
node scripts/testar-evolution-api.js
```

**Deve mostrar:**
- ✅ Evolution API acessível
- ✅ Instância `finflow` encontrada
- ✅ Status: `open` ou `connected`

## 🔍 Se Não Encontrar AUTHENTICATION_API_KEY

Se o arquivo `.env` da Evolution API não tiver a linha `AUTHENTICATION_API_KEY`:

1. **Adicione no `.env` da Evolution API:**
   ```env
   AUTHENTICATION_API_KEY=WebCond_2025_Evolution_API_Chave_Secreta_123!@#
   ```

2. **Reinicie a Evolution API**

3. **Use a mesma chave no `config.env` do backend**

## ⚠️ Importante

- ✅ As API Keys devem ser **EXATAMENTE IGUAIS**
- ✅ Sem espaços extras
- ✅ Sem aspas (se houver, remova)
- ✅ Case-sensitive

## 🧪 Após Configurar

Teste novamente o envio de WhatsApp. Deve funcionar!

