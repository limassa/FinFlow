# Backup do banco Claricash (Railway)

Backups e PITR do Railway exigem plano **Pro**. Neste projeto usamos `pg_dump` local.

## Pré-requisito

Cliente PostgreSQL com `pg_dump` no PATH (ou instalado em `C:\Program Files\PostgreSQL\...\bin`).

- Download: https://www.postgresql.org/download/windows/

## Configuração (senha fora do Git)

Use **uma** destas opções:

1. Variável de ambiente (sessão atual):

```powershell
$env:DATABASE_PUBLIC_URL = "postgresql://postgres:SENHA@HOST:PORTA/railway"
```

2. Arquivo `backend/config.env` (já no `.gitignore`) com:

```env
DATABASE_PUBLIC_URL=postgresql://postgres:SENHA@HOST:PORTA/railway
```

A URL está no Railway → serviço **Postgres** → **Variables** / **Connect**.

## Rodar o backup

Na raiz do repositório:

```powershell
.\scripts\backup-db.ps1
```

SQL texto (opcional):

```powershell
.\scripts\backup-db.ps1 -Format p
```

Arquivos saem em `backups/claricash-prod-AAAAMMDD-HHMMSS.dump` (pasta ignorada pelo Git).

## Restaurar (cuidado — sobrescreve dados)

```powershell
pg_restore -d "$env:DATABASE_PUBLIC_URL" --clean --if-exists .\backups\arquivo.dump
```

Prefira restaurar em um banco/serviço de teste antes de apontar para produção.

## Rotina sugerida

- Diário ou 2–3x por semana
- Copiar o `.dump` para nuvem/HD externo
- Testar restore de tempos em tempos

## Agendar todos os dias (Windows)

Instala no Agendador de Tarefas (padrão **03:00**):

```powershell
cd d:\Negocios\Projetos\Web\projeto-web
.\scripts\install-backup-task.ps1
```

Outro horário:

```powershell
.\scripts\install-backup-task.ps1 -Time 02:30
```

Testar agora:

```powershell
Start-ScheduledTask -TaskName 'Claricash-DB-Backup-Daily'
```

Ver log:

```powershell
Get-Content .\backups\backup-task.log -Tail 40
```

Remover o agendamento:

```powershell
.\scripts\install-backup-task.ps1 -Uninstall
```

**Obs.:** o PC precisa estar ligado (e, no modo padrão, com seu usuário).  
Para rodar mesmo com a tela bloqueada / sem login, abra o **Agendador de Tarefas** → tarefa `Claricash-DB-Backup-Daily` → propriedades → marque *Executar estando o usuário conectado ou não* (o Windows pede a senha da conta).
