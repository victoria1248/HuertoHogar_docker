# GUÍA: Genera secretos independientes una sola vez, sin guardarlos en el repositorio.
$ErrorActionPreference = 'Stop'
$raiz = Split-Path -Parent $PSScriptRoot
$archivo = Join-Path $raiz '.env'
if (Test-Path $archivo) {
    Write-Host 'Se conserva .env existente y las claves de MySQL/JWT.'
    exit 0
}
function Nueva-Clave([int]$cantidad) {
    $bytes = New-Object byte[] $cantidad
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try { $rng.GetBytes($bytes) } finally { $rng.Dispose() }
    return ([BitConverter]::ToString($bytes)).Replace('-', '').ToLowerInvariant()
}
$lineas = @(
    ('DB_PASSWORD=' + (Nueva-Clave 24)),
    ('MYSQL_ROOT_PASSWORD=' + (Nueva-Clave 24)),
    ('JWT_SECRET=' + (Nueva-Clave 32)),
    'FRONTEND_PORT=5173',
    'BACKEND_PORT=8080',
    'JWT_EXPIRATION_MS=1800000',
    'DOCKER_SEED_CATALOG=true',
    'DOCKER_DEMO_USERS=true',
    'DOCKER_RESET_DEMO_USERS=true'
)
[System.IO.File]::WriteAllLines($archivo, [string[]]$lineas, (New-Object System.Text.UTF8Encoding($false)))
Write-Host '.env creado con claves aleatorias. No lo compartas.'
