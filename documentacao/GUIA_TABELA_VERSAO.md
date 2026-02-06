# 📋 Guia - Tabela de Versão do Sistema FinFlow

## 🎯 Objetivo
Implementar um sistema de controle de versão para o FinFlow, exibindo informações da versão atual na tela de login.

## 📊 Estrutura da Tabela

### Tabela: `versao_sistema`
```sql
CREATE TABLE versao_sistema (
    versao_id SERIAL PRIMARY KEY,
    versao_numero VARCHAR(20) NOT NULL,
    versao_nome VARCHAR(100) NOT NULL,
    versao_data DATE NOT NULL,
    versao_descricao TEXT,
    versao_status VARCHAR(20) DEFAULT 'ATIVA',
    versao_ambiente VARCHAR(20) DEFAULT 'PRODUCAO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Campos:
- **versao_id**: ID único da versão
- **versao_numero**: Número da versão (ex: 1.0.0)
- **versao_nome**: Nome descritivo da versão
- **versao_data**: Data de lançamento
- **versao_descricao**: Descrição detalhada das mudanças
- **versao_status**: Status (ATIVA, INATIVA, BETA)
- **versao_ambiente**: Ambiente (PRODUCAO, DESENVOLVIMENTO, TESTE)

## 🔧 Implementação

### 1. Script SQL
- **Arquivo**: `ScriptSQL_Versao.sql`
- **Função**: Criar tabela e inserir versão inicial

### 2. Script de Execução
- **Arquivo**: `criar-tabela-versao.js`
- **Função**: Executar o SQL e verificar a criação

### 3. Backend - Endpoint
- **Arquivo**: `backend/app.js`
- **Endpoint**: `GET /api/versao`
- **Função**: Buscar versão ativa do sistema

### 4. Frontend - Configuração
- **Arquivo**: `src/config/api.js`
- **Adição**: `VERSAO: ${API_BASE_URL}/api/versao`

### 5. Frontend - Página de Login
- **Arquivo**: `src/pages/Login.js`
- **Funcionalidade**: Buscar e exibir versão na tela de login

### 6. Frontend - Estilos
- **Arquivo**: `src/App.css`
- **Classes**: `.version-info`, `.version-number`, `.version-name`, `.version-date`

## 🚀 Como Usar

### 1. Criar Tabela
```bash
node criar-tabela-versao.js
```

### 2. Testar Endpoint
```bash
node teste-versao.js
```

### 3. Atualizar Versão
Para atualizar a versão, execute no banco:
```sql
-- Desativar versão atual
UPDATE versao_sistema SET versao_status = 'INATIVA' WHERE versao_status = 'ATIVA';

-- Inserir nova versão
INSERT INTO versao_sistema (
    versao_numero, 
    versao_nome, 
    versao_data, 
    versao_descricao, 
    versao_status, 
    versao_ambiente
) VALUES (
    '1.1.0',
    'FinFlow v1.1.0 - Melhorias no Layout',
    '2024-12-19',
    'Melhorias na centralização dos gráficos e responsividade.',
    'ATIVA',
    'PRODUCAO'
);
```

## 📱 Exibição na Tela de Login

### Localização:
- **Posição**: Final do formulário de login
- **Estilo**: Card com fundo semi-transparente
- **Informações**: Número, nome e data da versão

### Estados:
1. **Carregando**: "Carregando informações..."
2. **Sucesso**: Exibe versão atual
3. **Erro**: "Versão não disponível"

## 🎨 Estilos CSS

### Classes Principais:
- `.version-info`: Container principal
- `.version-number`: Número da versão (azul, negrito)
- `.version-name`: Nome da versão (branco)
- `.version-date`: Data da versão (cinza claro)

### Responsividade:
- Adapta-se a diferentes tamanhos de tela
- Texto centralizado
- Cores contrastantes para boa legibilidade

## 🔍 Testes

### 1. Teste de Banco
```bash
node criar-tabela-versao.js
```

### 2. Teste de API
```bash
node teste-versao.js
```

### 3. Teste Frontend
- Acessar tela de login
- Verificar se a versão aparece
- Testar em diferentes dispositivos

## 📈 Benefícios

1. **Controle de Versão**: Identificação clara da versão atual
2. **Transparência**: Usuários sabem qual versão estão usando
3. **Suporte**: Facilita troubleshooting e suporte
4. **Histórico**: Mantém histórico de versões
5. **Ambiente**: Diferenciação entre ambientes

## 🛠️ Manutenção

### Adicionar Nova Versão:
1. Executar SQL para inserir nova versão
2. Testar endpoint `/api/versao`
3. Verificar exibição na tela de login

### Backup:
- A tabela `versao_sistema` deve ser incluída no backup do banco
- Manter histórico de versões para auditoria

## ✅ Status Atual

- ✅ Tabela criada no banco
- ✅ Endpoint implementado no backend
- ✅ Frontend configurado
- ✅ Estilos CSS aplicados
- ✅ Exibição na tela de login
- ✅ Scripts de teste criados

## 🎯 Próximos Passos

1. **Testar em produção**: Verificar se funciona no ambiente de produção
2. **Automatizar**: Criar script para atualização automática de versão
3. **Logs**: Implementar logs de acesso à versão
4. **Cache**: Implementar cache para melhor performance 