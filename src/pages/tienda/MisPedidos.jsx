// GUÍA: Presenta las compras asociadas al usuario.
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { apiRequest } from '../../servicios/api.js'

// GUÍA: Presenta las compras asociadas al usuario.
function MisPedidos() {
  const { usuario: sesion } = useAuth()
  // GUÍA: Estado de React: conserva los valores de esta sección y vuelve a renderizar al actualizarlos.
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  // GUÍA: Efecto de React: ejecuta la sincronización o suscripción de este bloque según sus dependencias; revisar la limpieza al desmontar.
  useEffect(() => {
    let activo = true
    if (!sesion?.correo) { setCargando(false); return () => { activo = false } }
    apiRequest('/api/v1/boletas/mis')
      .then(lista => { if (activo) setPedidos(Array.isArray(lista) ? lista : []) })
      .catch(err => { if (activo) setError(err.message || 'No se pudo cargar el historial de compras.') })
      .finally(() => { if (activo) setCargando(false) })
    return () => { activo = false }
  }, [sesion?.correo])

  const estilos = {
    pagina: { minHeight: '100vh', backgroundColor: '#f5f8f4', fontFamily: 'Arial, sans-serif', color: '#18392b' },
    tarjeta: { maxWidth: '1100px', backgroundColor: '#ffffff', borderRadius: '18px', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' },
    titulo: { color: '#174d32', fontWeight: 'bold' },
    texto: { color: '#334b40', lineHeight: 1.7 },
    boton: { backgroundColor: '#176b40', color: '#ffffff', borderRadius: '10px', textDecoration: 'none', fontWeight: 'bold', border: 'none' }
  }

  // GUÍA: Muestra seguimiento según los datos recibidos.
  function verSeguimiento(pedido) {
    window.location.href = '/seguimiento-pedido?id=' + encodeURIComponent(pedido.id)
  }

  // GUÍA: Punto de entrada de la operación fechaLegible; aquí se concentra su comportamiento.
  function fechaLegible(fecha) {
    const valor = new Date(fecha)
    return Number.isNaN(valor.getTime()) ? 'Fecha no disponible' : valor.toLocaleString('es-CL')
  }

  return (
    <main className="py-4 py-md-5 px-3" style={estilos.pagina}>
      <div className="container mx-auto p-3 p-sm-4 p-lg-5" style={estilos.tarjeta}>
        <h1 className="h2 mb-4" style={estilos.titulo}>📦 Mis pedidos</h1>
        {!sesion ? (
          <section>
            <h2 className="h4 mb-3">Inicia sesión para consultar tus pedidos</h2>
            <p className="fs-6" style={estilos.texto}>Para consultar tus compras y revisar el estado de tus entregas, necesitas iniciar sesión con tu cuenta de HuertoHogar.</p>
            <a href="/login?redirigir=%2Fmis-pedidos" className="btn px-4 py-3 mt-2" style={estilos.boton}>🔐 Iniciar sesión</a>
            <p className="mt-4" style={estilos.texto}>¿Todavía no tienes una cuenta? <a href="/registro" className="fw-bold" style={{ color: '#176b40' }}>Regístrate aquí</a></p>
          </section>
        ) : (
          <section>
            <h2 className="h4 mb-3">¡Hola, {sesion.nombre || 'cliente'}! 👋</h2>
            <p className="fs-6" style={estilos.texto}>Este historial se consulta directamente desde las boletas guardadas en MySQL.</p>
            {cargando ? <p role="status">Cargando tus compras…</p> : error ? <div className="alert alert-danger" role="alert">{error}</div> : pedidos.length === 0 ? (
              <div className="text-center p-4 p-md-5 mt-4" style={{ border: '1px dashed #b8d6c2', backgroundColor: '#f8fcf9', borderRadius: '14px' }}>
                <div style={{ fontSize: '45px' }}>🛒</div><h3 className="h5 mt-2" style={estilos.titulo}>Todavía no tienes pedidos</h3>
                <p className="text-secondary">Las próximas compras realizadas con tu cuenta aparecerán aquí.</p>
                <a href="/productos" className="btn px-4 py-3 mt-2" style={estilos.boton}>Explorar productos</a>
              </div>
            ) : (
              <div className="d-grid gap-3 mt-4">
                {pedidos.map(pedido => (
                  <article key={pedido.id} className="p-3 p-md-4" style={{ border: '1px solid #d5e6d9', borderRadius: '14px', background: '#f9fcfa' }}>
                    <div className="row g-3 align-items-start justify-content-between">
                      <div className="col-12 col-md-7 text-break">
                        <strong className="fs-5" style={estilos.titulo}>Boleta {pedido.folio || pedido.id}</strong>
                        <p className="text-secondary mb-2 mt-1">{fechaLegible(pedido.fecha)}</p>
                        <p className="mb-0" style={estilos.texto}>{Array.isArray(pedido.productos) ? pedido.productos.length : 0} producto(s)</p>
                      </div>
                      <div className="col-12 col-md-5 text-md-end">
                        <strong className="d-block fs-5" style={estilos.titulo}>${Number(pedido.total || 0).toLocaleString('es-CL')}</strong>
                        <span className={String(pedido.estado).toLowerCase() === 'suspendido' ? 'badge text-bg-danger mt-2' : 'badge text-bg-success mt-2'}>{pedido.estado || 'Pedido confirmado'}</span>
                        {pedido.motivoSuspension && <p className="mt-2 mb-0 text-danger text-break">Motivo: {pedido.motivoSuspension}</p>}
                      </div>
                    </div>
                    <button type="button" className="btn px-3 py-2 mt-3" style={estilos.boton} onClick={() => verSeguimiento(pedido)}>Ver detalle y seguimiento</button>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
        <div className="mt-4 pt-2"><a href="/" className="fw-bold text-decoration-none" style={{ color: '#176b40' }}>← Volver al inicio</a></div>
      </div>
    </main>
  )
}

export default MisPedidos
