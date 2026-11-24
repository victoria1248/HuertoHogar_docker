// GUÍA: Organiza las pantallas y navegación de este módulo.

import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import RutaProtegida from '../componentes/RutaProtegida.jsx'

// ========================================
// PÁGINAS ORIGINALES
// ========================================

import Login from '../pages/tienda/Login.jsx'
import Registro from '../pages/tienda/Registro.jsx'
import AdministrarUsuarios from '../pages/tienda/AdministrarUsuarios.jsx'
import AgregarAdministrador from '../pages/tienda/AgregarAdministrador.jsx'
import Dashboard from '../pages/tienda/Dashboard.jsx'
import MenuAdminCompartido from '../componentes/tienda/MenuAdminCompartido.jsx'
import Carrito from '../pages/tienda/Carrito.jsx'
import PagoEnvio from '../pages/tienda/PagoEnvio.jsx'
import Boleta from '../pages/tienda/Boleta.jsx'

// ========================================
// SISTEMA DE PEDIDOS
// ========================================

import AccesoPedidos from '../pages/tienda/AccesoPedidos.jsx'
import MisPedidos from '../pages/tienda/MisPedidos.jsx'
import SeguimientoPedido from '../pages/tienda/SeguimientoPedido.jsx'
import PedidosAdmin from '../pages/tienda/PedidosAdmin.jsx'

// ========================================
// PÁGINAS DE HUERTOHOGAR
// ========================================

import Inicio from '../pages/tienda/Inicio.jsx'
import Categorias from '../pages/tienda/Categorias.jsx'
import Productos from '../pages/tienda/Productos.jsx'

// ========================================
// APLICACIÓN PRINCIPAL
// ========================================

// GUÍA: Define el componente o clase App y reúne su comportamiento principal.
function App() {
  const { usuario } = useAuth()

  const rutaActual =
    useLocation().pathname.replace(/\/+$/, '') || '/'

  // Lista blanca de navegación por rol. La seguridad real también se aplica en Spring Security.
  const rutasVendedor = ['/productos', '/admin/pedidos', '/vendedor/pedidos']
  const rutasCliente = [
    '/', '/categorias', '/productos', '/carrito', '/pago-envio', '/boleta',
    '/acceso-pedidos', '/mis-pedidos', '/seguimiento-pedido'
  ]

  if (usuario?.rol === 'vendedor') {
    if (rutaActual === '/') return <Navigate to="/productos" replace />
    if (!rutasVendedor.includes(rutaActual)) return <Navigate to="/productos" replace />
  }

  if (usuario?.rol === 'cliente' && !rutasCliente.includes(rutaActual)) {
    return <Navigate to="/productos" replace />
  }

  // ======================================
  // INICIO
  // ======================================

  if (rutaActual === '/') {
    return usuario?.rol === 'vendedor' ? <Productos /> : <Inicio />
  }

  // ======================================
  // CATEGORÍAS
  // ======================================

  if (rutaActual === '/categorias') {
    return <Categorias />
  }

  // ======================================
  // PRODUCTOS
  // ======================================

  if (rutaActual === '/productos') {
    return <Productos />
  }

  // ======================================
  // LOGIN ORIGINAL
  // ======================================

  if (rutaActual === '/login') {
    return <Login />
  }

  // ======================================
  // REGISTRO ORIGINAL
  // ======================================

  if (rutaActual === '/registro') {
    return <Registro />
  }

  // ======================================
  // ADMINISTRACIÓN
  // ======================================

  if (rutaActual === '/dashboard' || rutaActual === '/admin') {
    return <RutaProtegida roles={['admin']}><MenuAdminCompartido /><Dashboard /></RutaProtegida>
  }

  if (rutaActual === '/admin/usuarios') {
    return <RutaProtegida roles={['admin']}><MenuAdminCompartido /><AdministrarUsuarios /></RutaProtegida>
  }

  if (rutaActual === '/admin/agregar') {
    return <RutaProtegida roles={['admin']}><MenuAdminCompartido /><AgregarAdministrador /></RutaProtegida>
  }


  if (rutaActual === '/admin/pedidos' || rutaActual === '/vendedor/pedidos') {
    return <RutaProtegida roles={['admin', 'vendedor']}><PedidosAdmin /></RutaProtegida>
  }

  // ======================================
  // CARRITO Y COMPRAS
  // ======================================

  if (rutaActual === '/carrito') {
    return usuario?.rol === 'vendedor' ? <Navigate to="/productos" replace /> : <Carrito />
  }

  if (rutaActual === '/pago-envio') {
    return <RutaProtegida roles={['cliente', 'admin']}><PagoEnvio /></RutaProtegida>
  }

  if (rutaActual === '/boleta') {
    return <RutaProtegida roles={['cliente', 'admin']}><Boleta /></RutaProtegida>
  }

  // ======================================
  // ACCESO A PEDIDOS
  // ======================================

  if (rutaActual === '/acceso-pedidos') {
    return <AccesoPedidos />
  }

  // ======================================
  // MIS PEDIDOS
  // ======================================

  if (rutaActual === '/seguimiento-pedido') {
    return <RutaProtegida roles={['cliente', 'admin']}><SeguimientoPedido /></RutaProtegida>
  }

  if (rutaActual === '/mis-pedidos') {
    return <RutaProtegida roles={['cliente', 'admin']}><MisPedidos /></RutaProtegida>
  }

  // ======================================
  // ERROR 404
  // ======================================

  return (
    <div
      style={{
        padding: '60px 20px',
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
        color: '#18392b'
      }}
    >
      <h1 style={{ color: '#174d32' }}>
        Error 404
      </h1>

      <p>
        La página que buscas no existe.
      </p>

      <a
        href="/"
        style={{ color: '#176b40' }}
      >
        Volver al inicio
      </a>
    </div>
  )
}

export default App
