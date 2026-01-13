# 🔧 Configuração de Produção - Banco de Dados

## 📋 Visão Geral

Este guia explica como configurar e usar o arquivo de configuração de produção para executar scripts no banco de dados de produção sem modificar o arquivo `config.env` principal.

## 🎯 Por que usar?

- **Isolamento**: Mantém as configurações de desenvolvimento e produção separadas
- **Segurança**: Evita sobrescrever acidentalmente as configurações locais
- **Facilidade**: Permite alternar entre ambientes rapidamente

## 📝 Configuração Inicial

### 1. Criar o arquivo de configuração

Copie o arquivo de exemplo:

```bash
cd backend
cp config.production.env.example config.production.env
```

### 2. Preencher com dados reais

Edite o arquivo `config.production.env` com as credenciais do banco de produção:

```env
DB_HOST=seu-host-producao.com
DB_PORT=5432
DB_NAME=nome-do-banco-producao
DB_USER=usuario-producao
DB_PASSWORD=sua-senha-producao
```

### 3. Verificar .gitignore

O arquivo `config.production.env` já está no `.gitignore` e **NÃO será commitado** no repositório.

## 🚀 Como Usar

### Executar script com configuração de produção

```bash
# Opção 1: Usando flag --production
node scripts/adicionar-coluna-whatsapp.js --production

# Opção 2: Usando variável de ambiente
CONFIG_FILE=config.production.env node scripts/adicionar-coluna-whatsapp.js
```

### Executar script com configuração padrão (desenvolvimento)

```bash
node scripts/adicionar-coluna-whatsapp.js
```

## 📁 Estrutura de Arquivos

```
backend/
├── config.env                    # Configuração de desenvolvimento (local)
├── config.env.example             # Exemplo de configuração de desenvolvimento
├── config.production.env          # Configuração de produção (NÃO commitado)
├── config.production.env.example   # Exemplo de configuração de produção
└── scripts/
    └── adicionar-coluna-whatsapp.js
```

## ⚠️ Importante

1. **NUNCA commite** o arquivo `config.production.env` com dados reais
2. **Sempre use** o arquivo `.example` como base
3. **Mantenha** as credenciais de produção seguras
4. **Verifique** sempre qual arquivo está sendo usado antes de executar scripts

## 🔍 Verificação

O script mostra qual arquivo de configuração está sendo usado:

```
📁 Usando arquivo de configuração: ./config.production.env
🔌 Conectando ao banco:
   Host: seu-host-producao.com
   Porta: 5432
   Database: nome-do-banco-producao
   User: usuario-producao
```

## 🆘 Troubleshooting

### Erro: "Cannot find module" ou "File not found"

- Verifique se o arquivo `config.production.env` existe na pasta `backend/`
- Verifique se você está executando o script da pasta correta

### Erro: "ECONNREFUSED" ou "ENOTFOUND"

- Verifique se as credenciais no arquivo estão corretas
- Verifique se o host do banco está acessível
- Verifique se a porta está correta

### Script usa configuração errada

- Verifique se está usando a flag `--production` ou a variável `CONFIG_FILE`
- O script mostra qual arquivo está sendo usado no início da execução

