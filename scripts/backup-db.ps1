<#
.SYNOPSIS
  Backup do Postgres de produção (Railway) via pg_dump.

.DESCRIPTION
  Lê a connection string de variável de ambiente ou de config.env (não versionado).
  Gera arquivo em backups/ com data/hora. Não imprime a senha.

.PARAMETER Format
  c = custom (pg_restore) | p = SQL texto | plain = alias de p

.PARAMETER OutDir
  Pasta de destino (padrão: backups na raiz do repo)

.EXAMPLE
  .\scripts\backup-db.ps1

.EXAMPLE
  .\scripts\backup-db.ps1 -Format p

.EXAMPLE
  $env:DATABASE_PUBLIC_URL = "postgresql://..."
  .\scripts\backup-db.ps1
#>
[CmdletBinding()]
param(
  [ValidateSet('c', 'p', 'plain', 'custom')]
  [string]$Format = 'c',

  [string]$OutDir = ''
)

$ErrorActionPreference = 'Stop'

function Get-RepoRoot {
  $here = $PSScriptRoot
  if (-not $here) { $here = Get-Location }
  return (Resolve-Path (Join-Path $here '..')).Path
}

function Read-EnvFileValue {
  param(
    [string]$FilePath,
    [string]$Key
  )
  if (-not (Test-Path $FilePath)) { return $null }
  foreach ($line in Get-Content $FilePath) {
    $trim = $line.Trim()
    if (-not $trim -or $trim.StartsWith('#')) { continue }
    if ($trim -match "^\s*$Key\s*=\s*(.+)\s*$") {
      $val = $Matches[1].Trim()
      if (($val.StartsWith('"') -and $val.EndsWith('"')) -or ($val.StartsWith("'") -and $val.EndsWith("'"))) {
        $val = $val.Substring(1, $val.Length - 2)
      }
      return $val
    }
  }
  return $null
}

function Find-ConnectionString {
  param([string]$Root)

  $keys = @('DATABASE_PUBLIC_URL', 'DATABASE_URL', 'DATABASE_URL_PRODUCTION')

  foreach ($k in $keys) {
    $fromEnv = [Environment]::GetEnvironmentVariable($k)
    if ($fromEnv) { return @{ Source = "env:$k"; Url = $fromEnv } }
  }

  $files = @(
    (Join-Path $Root 'backend\config.env'),
    (Join-Path $Root 'config.env'),
    (Join-Path $Root 'backend\config.production.env')
  )

  foreach ($file in $files) {
    foreach ($k in $keys) {
      $val = Read-EnvFileValue -FilePath $file -Key $k
      if ($val) {
        $rel = $file.Replace($Root, '.').TrimStart('\')
        return @{ Source = "$rel ($k)"; Url = $val }
      }
    }
  }

  return $null
}

function Mask-ConnectionString {
  param([string]$Url)
  if (-not $Url) { return '' }
  return [regex]::Replace($Url, '(://[^:/?]+:)([^@/]+)(@)', '${1}****${3}')
}

function Assert-PgDump {
  $cmd = Get-Command pg_dump -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }

  $candidates = @(
    'C:\Program Files\PostgreSQL\17\bin\pg_dump.exe',
    'C:\Program Files\PostgreSQL\16\bin\pg_dump.exe',
    'C:\Program Files\PostgreSQL\15\bin\pg_dump.exe',
    'C:\Program Files\PostgreSQL\14\bin\pg_dump.exe'
  )
  foreach ($p in $candidates) {
    if (Test-Path $p) { return $p }
  }
  return $null
}

$root = Get-RepoRoot
if (-not $OutDir) {
  $OutDir = Join-Path $root 'backups'
}

$found = Find-ConnectionString -Root $root
if (-not $found) {
  Write-Host 'ERRO: connection string nao encontrada.' -ForegroundColor Red
  Write-Host ''
  Write-Host 'Defina uma destas opcoes:'
  Write-Host '  1) $env:DATABASE_PUBLIC_URL = "postgresql://user:senha@host:porta/railway"'
  Write-Host '  2) backend/config.env com DATABASE_PUBLIC_URL=...'
  Write-Host ''
  Write-Host 'A URL esta no Railway: Postgres -> Variables / Connect.'
  exit 1
}

$pgDump = Assert-PgDump
if (-not $pgDump) {
  Write-Host 'ERRO: pg_dump nao encontrado no PATH.' -ForegroundColor Red
  Write-Host 'Instale o cliente PostgreSQL (Windows) e marque "Command Line Tools",'
  Write-Host 'ou adicione a pasta bin do Postgres ao PATH.'
  Write-Host 'Download: https://www.postgresql.org/download/windows/'
  exit 1
}

$fmt = $Format.ToLowerInvariant()
if ($fmt -eq 'plain') { $fmt = 'p' }
if ($fmt -eq 'custom') { $fmt = 'c' }

$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$ext = if ($fmt -eq 'c') { 'dump' } else { 'sql' }
$fileName = "claricash-prod-$stamp.$ext"

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$outFile = Join-Path $OutDir $fileName

Write-Host '=== Claricash DB Backup ===' -ForegroundColor Cyan
Write-Host ("Fonte : {0}" -f $found.Source)
Write-Host ("URL   : {0}" -f (Mask-ConnectionString $found.Url))
Write-Host ("pg_dump: {0}" -f $pgDump)
Write-Host ("Formato: {0}" -f $(if ($fmt -eq 'c') { 'custom (-Fc)' } else { 'SQL (-Fp)' }))
Write-Host ("Saida : {0}" -f $outFile)
Write-Host ''

$dumpArgs = @(
  "--dbname=$($found.Url)",
  '--no-owner',
  '--no-acl',
  '-F', $fmt,
  '-f', $outFile
)

$sw = [System.Diagnostics.Stopwatch]::StartNew()
& $pgDump @dumpArgs
$exit = $LASTEXITCODE
$sw.Stop()

if ($exit -ne 0) {
  Write-Host ("ERRO: pg_dump falhou (exit {0})." -f $exit) -ForegroundColor Red
  if (Test-Path $outFile) { Remove-Item $outFile -Force -ErrorAction SilentlyContinue }
  exit $exit
}

$size = (Get-Item $outFile).Length
$sizeMb = [math]::Round($size / 1MB, 2)

Write-Host 'Backup concluido.' -ForegroundColor Green
Write-Host ("Arquivo : {0}" -f $outFile)
Write-Host ("Tamanho : {0} MB" -f $sizeMb)
Write-Host ("Tempo   : {0}s" -f [math]::Round($sw.Elapsed.TotalSeconds, 1))
Write-Host ''
Write-Host 'Guarde uma copia fora do PC (Drive, OneDrive, HD externo).'
if ($fmt -eq 'c') {
  Write-Host 'Restaurar: pg_restore -d "postgresql://..." --clean --if-exists arquivo.dump'
} else {
  Write-Host 'Restaurar: psql "postgresql://..." -f arquivo.sql'
}
