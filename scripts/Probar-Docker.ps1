# GUÍA: Prueba real de HTTP, MySQL, roles, JWT y proxy. Crea una cuenta CLIENTE de prueba.
param([string]$BaseUrl = 'http://localhost:5173', [switch]$OmitirCuentasDemo)
$ErrorActionPreference = 'Stop'
$BaseUrl = $BaseUrl.TrimEnd('/')
function Afirmar($condicion, [string]$mensaje) {
    if (-not $condicion) { throw "FALLO: $mensaje" }
    Write-Host "OK: $mensaje" -ForegroundColor Green
}
function Estado([string]$ruta, [string]$metodo='GET', [hashtable]$cabeceras=@{}, [string]$cuerpo='') {
    try {
        $params = @{ Uri="$BaseUrl$ruta"; Method=$metodo; Headers=$cabeceras; UseBasicParsing=$true; TimeoutSec=30; ErrorAction='Stop' }
        if ($cuerpo) { $params.ContentType='application/json'; $params.Body=$cuerpo }
        return [int](Invoke-WebRequest @params).StatusCode
    } catch {
        if ($_.Exception.Response) { return [int]$_.Exception.Response.StatusCode }
        throw
    }
}
function Json([string]$ruta, [string]$metodo='GET', [hashtable]$cabeceras=@{}, [hashtable]$cuerpo=@{}) {
    $params = @{ Uri="$BaseUrl$ruta"; Method=$metodo; Headers=$cabeceras; TimeoutSec=30; ErrorAction='Stop' }
    if ($cuerpo.Count -gt 0) { $params.ContentType='application/json'; $params.Body=($cuerpo | ConvertTo-Json -Compress) }
    Invoke-RestMethod @params
}
Afirmar ((Json '/actuator/health/readiness').status -eq 'UP') 'Spring Boot y MySQL listos'
Afirmar ((Estado '/') -eq 200) 'Frontend disponible'
Afirmar ((Estado '/dashboard') -eq 200) 'React Router al recargar una ruta'
Afirmar ((Estado '/swagger-ui/index.html') -eq 200) 'Swagger disponible'
Afirmar ((Json '/v3/api-docs').openapi -like '3.*') 'OpenAPI funciona por el proxy'
$productos = @((Json '/api/v1/productos') | ForEach-Object { $_ })
Afirmar ($productos.Count -gt 0 -and [bool]$productos[0].codigo) 'Catalogo consultado desde MySQL (requiere catalogo no vacio)'
Afirmar ((Estado '/api/v1/auth/me') -eq 401) 'Sin JWT no se puede consultar la sesion'
# GUÍA: Verifica las cuentas originales, los roles y los permisos reales sin cambiar el inventario.
# Omitir este bloque solo si la demostración se desactivó explícitamente.
if (-not $OmitirCuentasDemo) {
    $admin = Json '/api/v1/auth/login' 'POST' @{} @{ correo='admin@huertohogar.cl'; password='Admin123!' }
    Afirmar ([bool]$admin.token -and $admin.rol -eq 'ADMIN') 'Cuenta original ADMIN disponible'
    $authAdmin = @{ Authorization=('Bearer ' + $admin.token) }
    Afirmar ((Json '/api/v1/auth/me' 'GET' $authAdmin).rol -eq 'ADMIN') 'JWT identifica al ADMIN'
    Afirmar ((Estado '/api/v1/boletas' 'GET' $authAdmin) -eq 200) 'ADMIN puede consultar todas las boletas'
    Afirmar ((Estado '/api/v1/auth/logout' 'POST' $authAdmin) -eq 204) 'Cierre de sesion ADMIN'
    $cliente = Json '/api/v1/auth/login' 'POST' @{} @{ correo='cliente@huertohogar.cl'; password='Cliente123!' }
    Afirmar ([bool]$cliente.token -and $cliente.rol -eq 'CLIENTE') 'Cuenta original CLIENTE disponible'
    $authCliente = @{ Authorization=('Bearer ' + $cliente.token) }
    Afirmar ((Json '/api/v1/auth/me' 'GET' $authCliente).rol -eq 'CLIENTE') 'JWT identifica al CLIENTE'
    Afirmar ((Estado '/api/v1/boletas' 'GET' $authCliente) -eq 403) 'CLIENTE no puede consultar todas las boletas'
    Afirmar ((Estado '/api/v1/auth/logout' 'POST' $authCliente) -eq 204) 'Cierre de sesion CLIENTE'
}
$correo = 'docker-test-' + [Guid]::NewGuid().ToString('N') + '@example.com'
$clave = [Guid]::NewGuid().ToString('N') + 'Aa1!'
$registro = @{ nombre='Prueba Docker'; edad=25; correo=$correo; password=$clave }
Afirmar ((Estado '/api/v1/auth/registro' 'POST' @{} ($registro | ConvertTo-Json -Compress)) -eq 201) 'Registro en MySQL'
$login = Json '/api/v1/auth/login' 'POST' @{} @{ correo=$correo; password=$clave }
Afirmar ([bool]$login.token -and $login.rol -eq 'CLIENTE') 'Login devuelve JWT y rol CLIENTE'
$auth = @{ Authorization=('Bearer ' + $login.token) }
Afirmar ((Json '/api/v1/auth/me' 'GET' $auth).correo -eq $correo) 'JWT identifica al usuario'
Afirmar ((Estado '/api/v1/categorias' 'GET' $auth) -eq 200) 'Consulta de categorias como cliente'
Afirmar ((Estado '/api/v1/carrito' 'GET' $auth) -eq 200) 'Consulta del carrito autenticado'
Afirmar ((Estado '/api/v1/productos' 'POST' $auth '{}') -eq 403) 'Cliente no puede crear productos'
Afirmar ((Estado '/api/v1/auth/logout' 'POST' $auth) -eq 204) 'Cierre de sesion'
Afirmar ((Estado '/api/v1/auth/me' 'GET' $auth) -eq 401) 'JWT revocado en MySQL'
Write-Host "Prueba completa. Cuenta creada: $correo (sin compras ni cambios de inventario)."
