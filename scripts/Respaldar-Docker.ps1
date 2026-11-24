# GUÍA: Exporta una copia lógica de MySQL sin revelar contraseñas ni borrar el volumen.
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path -Parent $PSScriptRoot)
if (-not (Test-Path '.env')) { throw 'Falta .env original. No se puede respaldar.' }
$dir = Join-Path (Get-Location) 'respaldos'
New-Item -ItemType Directory -Force -Path $dir | Out-Null
$nombre = 'huertohogar-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '-' + [Guid]::NewGuid().ToString('N').Substring(0,8) + '.sql'
$destino = Join-Path $dir $nombre
# El archivo temporal se crea dentro del contenedor para evitar alteraciones de codificacion en PowerShell.
$temporal = '/tmp/' + $nombre
try {
    docker compose exec -T db sh -c ('MYSQL_PWD=$MYSQL_ROOT_PASSWORD mysqldump -u root --single-transaction --no-tablespaces --set-gtid-purged=OFF --default-character-set=utf8mb4 huertohogar > ' + $temporal)
    if ($LASTEXITCODE -ne 0) { throw 'mysqldump fallo. Comprueba que MySQL este iniciado y .env corresponda al volumen.' }
    docker compose cp ('db:' + $temporal) $destino
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path $destino) -or (Get-Item $destino).Length -lt 100) { throw 'No se pudo copiar un respaldo valido.' }
    Write-Host "Respaldo guardado en $destino. Contiene datos privados; no lo compartas."
} catch {
    if (Test-Path $destino) { Remove-Item $destino -Force }
    throw
} finally {
    docker compose exec -T db rm -f $temporal 2>$null | Out-Null
}
