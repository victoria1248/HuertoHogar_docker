# GUÍA: Muestra el estado, recursos y errores sin imprimir la configuracion secreta de .env.
$ErrorActionPreference = 'Continue'
Set-Location (Split-Path -Parent $PSScriptRoot)
docker compose ps
if ($LASTEXITCODE -ne 0) { exit 1 }
$ids = @(docker compose ps -q)
if ($ids.Count -gt 0) { docker stats --no-stream $ids }
Write-Host '--- Ultimos registros ---'
docker compose logs --tail 40
Write-Host '--- Espacio Docker (global) ---'
docker system df
