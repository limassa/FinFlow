# 🔧 Resolver Problema na Porta 8080

## 🎯 Situação

- Container `evolution-api` está **parado** (Exited)
- Mas a **porta 8080 está em uso** por outro processo (PID 5048)
- Isso causa o erro "Not Found"

## ✅ Soluções

### Solução 1: Parar Processo Conflitante e Reiniciar Container

```powershell
# Parar o processo que está usando a porta 8080
Stop-Process -Id 5048 -Force -ErrorAction SilentlyContinue

# Aguardar alguns segundos
Start-Sleep -Seconds 3

# Reiniciar container Evolution API
docker start evolution-api

# Aguardar iniciar
Start-Sleep -Seconds 20

# Verificar
docker ps | findstr evolution
```

### Solução 2: Usar Porta Diferente

Se não conseguir parar o processo:

```powershell
# Parar container atual
docker stop evolution-api
docker rm evolution-api

# Criar com porta diferente (8081)
docker run -d `
  --name evolution-api `
  -p 8081:8080 `
  -e AUTHENTICATION_API_KEY="WebCond_2025_Evolution_API_Chave_Secreta_123!@#" `
  atendai/evolution-api:latest

# Acessar em: http://localhost:8081
```

**E atualizar `config.env`:**
```env
EVOLUTION_API_URL=http://localhost:8081
```

### Solução 3: Identificar e Parar o Processo Corretamente

```powershell
# Ver qual processo está usando a porta
netstat -ano | findstr :8080

# Ver detalhes do processo
Get-Process -Id 5048 | Select-Object Id, ProcessName, Path

# Se for outro serviço que você não precisa, pare:
Stop-Process -Id 5048 -Force
```

## 🔍 Verificar o que Está Rodando

```powershell
# Ver todos os processos na porta 8080
netstat -ano | findstr :8080

# Ver detalhes do processo principal
$port = netstat -ano | findstr :8080 | Select-Object -First 1
$pid = ($port -split '\s+')[-1]
Get-Process -Id $pid | Select-Object Id, ProcessName, Path, StartTime
```

## 📋 Passos Recomendados

1. **Identificar o processo:**
   ```powershell
   Get-Process -Id 5048
   ```

2. **Se for outro serviço necessário, use porta diferente (Solução 2)**

3. **Se não for necessário, pare e reinicie (Solução 1)**

4. **Verificar se Evolution API está rodando:**
   ```powershell
   docker ps | findstr evolution
   ```

5. **Acessar:**
   - `http://localhost:8080` (se usou Solução 1)
   - `http://localhost:8081` (se usou Solução 2)

## ⚠️ Cuidado

Não pare processos do sistema sem saber o que são. Se o PID 5048 for um processo importante, use a **Solução 2** (porta diferente).

## ✅ Após Resolver

1. Acesse a interface da Evolution API
2. Crie instância `webcond`
3. Escaneie QR Code
4. Teste a conexão

