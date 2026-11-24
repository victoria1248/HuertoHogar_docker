// GUÍA: Muestra los artículos seleccionados y permite modificar cantidades o continuar la compra.
import EncabezadoUsuario from '../../componentes/tienda/EncabezadoUsuario.jsx'
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import {
  obtenerCarritoActual,
  actualizarCantidadCarrito,
  eliminarProductoCarrito,
  vaciarCarritoActual,
} from '../../servicios/carritoApi.js'

const logoHuerto = '/img/Logo_2.png'

import '../../css/tienda/carrito.css'

// GUÍA: Formatea un importe para mostrarlo en la interfaz.
function formatoPrecio(valor) {
  return '$' + Number(valor || 0).toLocaleString('es-CL')
}

// GUÍA: Muestra los artículos seleccionados y permite modificar cantidades o continuar la compra.
function Carrito() {
  const { autenticado } = useAuth()
  // GUÍA: Estado de React: conserva los valores de esta sección y vuelve a renderizar al actualizarlos.
  const [productos, setProductos] = useState([])
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(true)
  const [operando, setOperando] = useState(false)

  // Consulta el carrito persistente del usuario en Spring Boot/MySQL.
  // Si todavía es visitante, el servicio muestra su carrito temporal.
  // GUÍA: Efecto de React: ejecuta la sincronización o suscripción de este bloque según sus dependencias; revisar la limpieza al desmontar.
  useEffect(() => {
    let activo = true

    // GUÍA: Carga carrito según los datos recibidos.
    async function cargarCarrito() {
      try {
        setCargando(true)
        const lista = await obtenerCarritoActual()
        if (activo) setProductos(lista)
      } catch (error) {
        if (activo) setMensaje(error.message || 'No se pudo consultar el carrito.')
      } finally {
        if (activo) setCargando(false)
      }
    }

    cargarCarrito()
    window.addEventListener('sesionActualizada', cargarCarrito)
    return () => {
      activo = false
      window.removeEventListener('sesionActualizada', cargarCarrito)
    }
  }, [])

  // GUÍA: Modifica la cantidad seleccionada de un producto.
  async function cambiarCantidad(indice, cambio) {
    const producto = productos[indice]
    if (!producto || operando) return

    const cantidadActual = Number(producto.cantidad) || 1
    const nuevaCantidad = cantidadActual + cambio
    if (nuevaCantidad < 1) return
    if (nuevaCantidad > Number(producto.stock)) {
      setMensaje(`No hay stock suficiente. Disponible: ${producto.stock} ${producto.plural || producto.unidad || 'unidades'}.`)
      return
    }

    try {
      setOperando(true)
      const actualizados = await actualizarCantidadCarrito(producto, nuevaCantidad)
      setProductos(actualizados)
      setMensaje(`Cantidad de ${producto.nombre} actualizada.`)
    } catch (error) {
      setMensaje(error.message || 'No se pudo actualizar la cantidad.')
    } finally {
      setOperando(false)
    }
  }

  // GUÍA: Elimina producto según los datos recibidos.
  async function eliminarProducto(indice) {
    const producto = productos[indice]
    if (!producto || operando) return

    try {
      setOperando(true)
      const actualizados = await eliminarProductoCarrito(producto)
      setProductos(actualizados)
      setMensaje('Producto eliminado del carrito.')
    } catch (error) {
      setMensaje(error.message || 'No se pudo eliminar el producto.')
    } finally {
      setOperando(false)
    }
  }

  // GUÍA: Vacía carrito según los datos recibidos.
  async function vaciarCarrito() {
    if (productos.length === 0 || operando) return

    const confirmar = window.confirm('¿Quieres eliminar todos los productos del carrito?')
    if (!confirmar) return

    try {
      setOperando(true)
      await vaciarCarritoActual()
      setProductos([])
      setMensaje('El carrito se vació correctamente.')
    } catch (error) {
      setMensaje(error.message || 'No se pudo vaciar el carrito.')
    } finally {
      setOperando(false)
    }
  }

  const cantidadTotal = productos.reduce(
    (total, producto) => total + (Number(producto.cantidad) || 1), 0
  )

  const subtotal = productos.reduce(
    (total, producto) => total + (Number(producto.precio) || 0) * (Number(producto.cantidad) || 1), 0
  )

  const envio = 0
  const total = subtotal + envio

  // GUÍA: Gestiona el paso del carrito a la pantalla de compra.
  function continuarCompra() {
    if (cargando) return
    if (productos.length === 0) {
      setMensaje('Agrega productos antes de continuar.')
      return
    }

    window.location.href = autenticado
      ? '/pago-envio'
      : '/login?redirigir=%2Fpago-envio'
  }

  return (

    <div className="carrito-pagina">

      <div className="carrito-franja-superior" />



      <header className="carrito-header d-flex flex-wrap align-items-center justify-content-between gap-3">

        <a href="/" className="carrito-marca">

          <img

            src={logoHuerto}

            alt="Logo de HuertoHogar"

            className="carrito-logo-imagen img-fluid"

          />

        </a>



        <nav className="carrito-navegacion d-flex flex-wrap align-items-center gap-3">

          <a href="/">Inicio</a>

          <EncabezadoUsuario />



          <a

            href="/carrito"

            className="carrito-enlace-activo"

          >

            🛒 Carrito ({cantidadTotal})

          </a>

        </nav>

      </header>



      <main className="carrito-contenido container-fluid">

        <div className="carrito-introduccion">

          <span className="carrito-etiqueta">

            TU COMPRA

          </span>



          <h1>Mi carrito de compras</h1>



          <p>

            Revisa tus productos, modifica las cantidades

            y consulta el total antes de continuar.

          </p>

        </div>



        {mensaje && (

          <div

            className="carrito-mensaje alert alert-success d-flex align-items-center justify-content-between gap-3"

            role="status"

          >

            <span>{mensaje}</span>



            <button

              type="button"

              onClick={() => setMensaje('')}

              aria-label="Cerrar mensaje"

            >

              ×

            </button>

          </div>

        )}



        <div className="carrito-distribucion">

          <section className="carrito-tarjeta">

            <div className="carrito-tarjeta-encabezado d-flex flex-wrap align-items-center justify-content-between gap-3">

              <div>

                <h2>Productos seleccionados</h2>



                <p>

                  {cantidadTotal} producto(s) en tu carrito

                </p>

              </div>



              {productos.length > 0 && (

                <button

                  type="button"

                  className="carrito-vaciar"

                  onClick={vaciarCarrito}
                  disabled={operando}

                >

                  Vaciar carrito

                </button>

              )}

            </div>



            {cargando ? (

              <div className="carrito-vacio" role="status">
                <h3>Consultando tu carrito...</h3>
                <p>Estamos recuperando tus productos guardados.</p>
              </div>

            ) : productos.length === 0 ? (

              <div className="carrito-vacio">

                <div className="carrito-vacio-icono">

                  🛒

                </div>



                <h3>Tu carrito está vacío</h3>



                <p>

                  Todavía no tienes productos agregados.

                </p>



                <a

                  href="/"

                  className="carrito-boton-verde d-inline-block"

                >

                  Explorar productos

                </a>

              </div>

            ) : (

              <div className="carrito-lista">

                {productos.map((producto, indice) => {

                  const precio =

                    Number(producto.precio) || 0



                  const cantidad =

                    Number(producto.cantidad) || 1



                  const totalProducto =

                    precio * cantidad



                  const imagen =

                    producto.imagen ||

                    producto.img ||

                    producto.foto ||

                    ''



                  return (

                    <article

                      className="carrito-producto"

                      key={producto.id ?? indice}

                    >

                      <div className="carrito-producto-imagen">

                        {imagen ? (

                          <img

                            src={imagen}

                            alt={

                              producto.nombre ||

                              'Producto'

                            }

                            onError={evento => {

                              evento.currentTarget.style.display =

                                'none'

                            }}

                          />

                        ) : (

                          <span>🥬</span>

                        )}

                      </div>



                      <div className="carrito-producto-info text-break">

                        <h3>

                          {producto.nombre || 'Producto'}

                        </h3>



                        <p>Precio unitario</p>



                        <strong>

                          {formatoPrecio(precio)}

                        </strong>

                      </div>



                      <div className="carrito-producto-controles">

                        <div className="carrito-cantidad">

                          <button

                            type="button"

                            onClick={() =>

                              cambiarCantidad(indice, -1)

                            }
                            disabled={operando || cantidad <= 1}

                            aria-label="Disminuir cantidad"

                          >

                            −

                          </button>



                          <span>{cantidad}</span>



                          <button

                            type="button"

                            onClick={() =>

                              cambiarCantidad(indice, 1)

                            }
                            disabled={operando || cantidad >= Number(producto.stock)}

                            aria-label="Aumentar cantidad"

                          >

                            +

                          </button>

                        </div>



                        <strong className="carrito-producto-total">

                          {formatoPrecio(totalProducto)}

                        </strong>



                        <button

                          type="button"

                          className="carrito-eliminar"

                          onClick={() =>

                            eliminarProducto(indice)

                          }
                          disabled={operando}

                        >

                          🗑 Eliminar

                        </button>

                      </div>

                    </article>

                  )

                })}

              </div>

            )}



            {productos.length > 0 && (

              <div className="carrito-seguir">

                <a href="/">

                  ← Seguir comprando

                </a>

              </div>

            )}

          </section>



          <aside className="carrito-resumen">

            <div className="carrito-resumen-encabezado">

              <span>🧾</span>

              <h2>Resumen de compra</h2>

            </div>



            <div className="carrito-resumen-fila">

              <span>

                Productos ({cantidadTotal})

              </span>



              <strong>

                {formatoPrecio(subtotal)}

              </strong>

            </div>



            <div className="carrito-resumen-fila">

              <span>Envío</span>



              <strong className="carrito-gratis">

                Gratis

              </strong>

            </div>



            <div className="carrito-resumen-separador" />



            <div className="carrito-resumen-total">

              <span>Total a pagar</span>



              <strong>

                {formatoPrecio(total)}

              </strong>

            </div>



            <button

              type="button"

              className="carrito-boton-pagar w-100"

              onClick={continuarCompra}

              disabled={cargando || operando || productos.length === 0}

            >

              Continuar con el pago →

            </button>



            <div className="carrito-nota">

              <span>🔒</span>



              <p>

                Podrás revisar los datos de entrega

                antes de confirmar tu compra.

              </p>

            </div>

          </aside>

        </div>

      </main>



      <footer className="carrito-footer">

        <p>

          © HuertoHogar · Productos frescos para tu hogar

        </p>

      </footer>

    </div>

  )

}



export default Carrito
