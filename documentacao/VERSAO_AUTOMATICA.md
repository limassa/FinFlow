# Versão automática do sistema

A versão do Claricash (web e app) é obtida **sempre da tabela `versao_sistema`** no banco de dados. Toda vez que há um **commit**, um novo registro é inserido na tabela, incrementando a versão (ex: 1.0.1 → 1.0.2).

## Como funciona

1. **Hook pós-commit** (`.git/hooks/post-commit`)  
   Após cada `git commit`, o script `scripts/post-commit-hook.js` é executado e chama `atualizarVersao()` em `scripts/atualizar-versao.js`.

2. **Incremento da versão**  
   O script:
   - Lê a última versão na tabela (ex: `1.0.1`);
   - Incrementa o patch (ex: `1.0.2`);
   - Marca a versão anterior do mesmo ambiente como `INATIVA`;
   - Insere um novo registro com `versao_numero`, `versao_mobile`, `versao_status = 'ATIVA'`, etc.

3. **Exibição da versão**  
   - **Web:** a tela de login chama `GET /api/versao` e exibe `versao_numero` e `versao_nome`.  
   - **App:** as telas (ex: Home, Configurações) chamam `GET /api/versao/mobile` e exibem `versao_mobile` (ou `versao_numero`).

Ou seja, **web e app sempre mostram a versão que está na tabela** (última versão ativa).

## Pré-requisitos

1. **Tabela `versao_sistema`**  
   Se ainda não existir, crie e insira a versão inicial:

   ```bash
   cd backend
   node scripts/criar-tabela-versao.js
   ```

   Isso cria a tabela com as colunas: `versao_id`, `versao_numero`, `versao_nome`, `versao_data`, `versao_descricao`, `versao_status`, `versao_ambiente`, `versao_mobile`.

2. **Hook pós-commit**  
   O hook já deve estar em `.git/hooks/post-commit` apontando para:

   ```sh
   #!/bin/sh
   node "D:\Negocios\Projetos\Web\projeto-web\scripts\post-commit-hook.js"
   ```

   Ajuste o caminho se o projeto estiver em outro diretório.

3. **Banco de dados**  
   - Em branches normais: o script usa as variáveis de ambiente do backend (ex: `backend/config.env`: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`).  
   - Na branch `production`: **é obrigatório** definir `RAILWAY_DB_PASSWORD` no `backend/config.env` para o hook atualizar a versão no banco do Railway. Se não estiver definido, o hook apenas exibe um aviso e o commit segue normalmente (versão não é incrementada na tabela).

   Exemplo no `backend/config.env` (apenas na sua máquina; o arquivo está no `.gitignore`):

   ```env
   RAILWAY_DB_PASSWORD=sua_senha_do_banco_railway
   # Opcional: RAILWAY_DB_HOST, RAILWAY_DB_PORT, RAILWAY_DB_NAME, RAILWAY_DB_USER
   ```

Se o banco não estiver acessível no momento do commit, o hook não quebra o commit (ele trata o erro e termina com sucesso).

## Incremento manual (sem commit)

Para subir a versão sem fazer commit (por exemplo, em CI ou em um ambiente sem git):

```bash
cd backend
node scripts/incrementar-versao.js
```

Opcional: passar descrição:

```bash
node scripts/incrementar-versao.js --descricao="Deploy produção"
```

## Resumo

| Onde        | O que faz |
|------------|-----------|
| Cada commit | Roda `post-commit-hook.js` → `atualizarVersao()` → INSERT na `versao_sistema` (incremento semver no patch). |
| Web        | `GET /api/versao` → lê última versão ativa na tabela → exibe na tela de login. |
| App        | `GET /api/versao/mobile` → lê última versão ativa (com `versao_mobile`) → exibe em Home/Configurações. |

Assim, a versão fica **automática** a cada commit e **única** para web e app, sempre vinda da tabela.
