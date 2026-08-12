<#
.SYNOPSIS
  Agenda o backup diario do banco Claricash no Agendador de Tarefas do Windows.

.DESCRIPTION
  Cria a tarefa "Claricash-DB-Backup-Daily" que executa scripts\backup-db.ps1
  todos os dias no horario informado (padrao 03:00).

.PARAMETER Time
  Horario no formato HH:mm (24h). Padrao: 03:00

.PARAMETER Uninstall
  Remove a tarefa agendada.

.EXAMPLE
  .\scripts\install-backup-task.ps1

.EXAMPLE
  .\scripts\install-backup-task.ps1 -Time 02:30

.EXAMPLE
  .\scripts\install-backup-task.ps1 -Uninstall
#>
[CmdletBinding()]
param(
  [string]$Time = '03:00',
  [switch]$Uninstall
)

$ErrorActionPreference = 'Stop'

$TaskName = 'Claricash-DB-Backup-Daily'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$backupScript = Join-Path $repoRoot 'scripts\backup-db.ps1'
$logDir = Join-Path $repoRoot 'backups'
$logFile = Join-Path $logDir 'backup-task.log'

if ($Uninstall) {
  $existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
  if ($existing) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Host "Tarefa removida: $TaskName" -ForegroundColor Green
  } else {
    Write-Host "Tarefa nao encontrada: $TaskName" -ForegroundColor Yellow
  }
  exit 0
}

if (-not (Test-Path $backupScript)) {
  Write-Host "ERRO: script nao encontrado: $backupScript" -ForegroundColor Red
  exit 1
}

if ($Time -notmatch '^\d{1,2}:\d{2}$') {
  Write-Host 'ERRO: -Time deve ser HH:mm (ex.: 03:00)' -ForegroundColor Red
  exit 1
}

$parts = $Time.Split(':')
$hour = [int]$parts[0]
$minute = [int]$parts[1]
if ($hour -lt 0 -or $hour -gt 23 -or $minute -lt 0 -or $minute -gt 59) {
  Write-Host 'ERRO: horario invalido.' -ForegroundColor Red
  exit 1
}

New-Item -ItemType Directory -Force -Path $logDir | Out-Null

# Wrapper: garante working directory + log
$runnerPs1 = Join-Path $repoRoot 'scripts\_run-backup-scheduled.ps1'
@"
`$ErrorActionPreference = 'Continue'
`$root = '$($repoRoot.Replace("'", "''"))'
`$log = Join-Path `$root 'backups\backup-task.log'
`$stamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
Add-Content -Path `$log -Value "[`$stamp] INICIO backup agendado"
Set-Location `$root
try {
  & powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path `$root 'scripts\backup-db.ps1') *>> `$log
  `$code = `$LASTEXITCODE
  `$stamp2 = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
  Add-Content -Path `$log -Value "[`$stamp2] FIM exit=`$code"
} catch {
  Add-Content -Path `$log -Value ("ERRO: " + `$_.Exception.Message)
}
"@ | Set-Content -Path $runnerPs1 -Encoding UTF8

$action = New-ScheduledTaskAction `
  -Execute 'powershell.exe' `
  -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$runnerPs1`"" `
  -WorkingDirectory $repoRoot

$trigger = New-ScheduledTaskTrigger -Daily -At ([datetime]::Today.AddHours($hour).AddMinutes($minute))

$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -StartWhenAvailable `
  -RunOnlyIfNetworkAvailable

# Roda no usuario atual (quando estiver logado / com sessao).
# Para rodar mesmo sem login, use Conta do Sistema / senha no Agendador.
$principal = New-ScheduledTaskPrincipal `
  -UserId $env:USERNAME `
  -LogonType Interactive `
  -RunLevel Limited

$existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existing) {
  Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

Register-ScheduledTask `
  -TaskName $TaskName `
  -Action $action `
  -Trigger $trigger `
  -Settings $settings `
  -Principal $principal `
  -Description 'Backup diario do Postgres Claricash (Railway) via pg_dump' `
  | Out-Null

Write-Host 'Tarefa agendada com sucesso.' -ForegroundColor Green
Write-Host ("Nome     : {0}" -f $TaskName)
Write-Host ("Horario  : todos os dias as {0:00}:{1:00}" -f $hour, $minute)
Write-Host ("Script   : {0}" -f $backupScript)
Write-Host ("Log      : {0}" -f $logFile)
Write-Host ''
Write-Host 'Testar agora:'
Write-Host ("  Start-ScheduledTask -TaskName '{0}'" -f $TaskName)
Write-Host ''
Write-Host 'Remover:'
Write-Host '  .\scripts\install-backup-task.ps1 -Uninstall'
Write-Host ''
Write-Host 'Obs.: com LogonType Interactive a tarefa roda com seu usuario.'
Write-Host 'Mantenha o PC ligado no horario, ou altere no Agendador de Tarefas'
Write-Host 'para "Executar estando o usuario conectado ou nao" (pede senha do Windows).'
