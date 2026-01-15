# 📦 Instalar Dependências da Evolution API

## 🎯 Problema Identificado

O diretório `node_modules` não existe, o que significa que as dependências não foram instaladas.

## ✅ Solução

### Passo 1: Navegar para o Diretório

```powershell
cd D:\Negocios\Projetos\Web\projeto-web\services\evolution-api
```

### Passo 2: Instalar Dependências

```powershell
npm install
```

**Isso pode levar alguns minutos** dependendo da sua conexão.

### Passo 3: Verificar Instalação

Após a instalação, verifique se `node_modules` foi criado:

```powershell
Test-Path node_modules
```

Deve retornar `True`.

### Passo 4: Iniciar a Evolution API

```powershell
npm start
```

## ⚠️ Se Der Erro na Instalação

### Erro: "npm não é reconhecido"

**Solução:** Instale o Node.js:
- Baixe de: https://nodejs.org/
- Instale a versão LTS
- Reinicie o terminal

### Erro: "Permission denied"

**Solução:** Execute o PowerShell como Administrador

### Erro: "Network timeout"

**Solução:** 
1. Verifique sua conexão com a internet
2. Tente novamente: `npm install`
3. Ou use um mirror: `npm install --registry https://registry.npmjs.org/`

## 📋 Checklist

- [ ] Node.js instalado (`node --version`)
- [ ] npm instalado (`npm --version`)
- [ ] No diretório correto (`services/evolution-api`)
- [ ] Dependências instaladas (`node_modules` existe)
- [ ] Arquivo `.env` configurado corretamente
- [ ] PostgreSQL acessível na porta 5433
- [ ] Tentou iniciar: `npm start`

## 🆘 Se Ainda Não Funcionar

Após instalar as dependências e tentar `npm start`, copie a mensagem de erro completa e me envie.

