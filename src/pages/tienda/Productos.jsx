// GUÍA: Catálogo, filtro de categorías, cantidades y acciones de carrito.
import React, { useEffect, useMemo, useState } from 'react'
import { leerInventario } from '../../datos/inventario.js'
import { consultarCatalogo } from '../../servicios/catalogoApi.js'
import { filtrarCatalogo, paginarCatalogo } from '../../datos/paginacionCatalogo.js'
import { agregarProductoAlCarrito, obtenerCarritoActual } from '../../servicios/carritoApi.js'
import { useAuth } from '../../context/AuthContext.jsx'

// ========================================
// ESTILOS ORIGINALES
// ========================================

import '../../css/tienda/estilos.css'
import '../../css/tienda/pago_envio.css'
import '../../css/tienda/comun.css'
import '../../css/tienda/producto.css'
import '../../css/tienda/catalogo-mejorado.css'

// ========================================
// IMÁGENES ORIGINALES
// ========================================

const logo = '/img/Logo_2.png'
const naranja = '/img/naranja.png'
const platano = '/img/platano.png'
const manzana = '/img/manzana.png'
const pera = '/img/pera.png'
const kiwi = '/img/kiwi.png'
const frutilla = '/img/frutilla.png'
import EncabezadoUsuario from '../../componentes/tienda/EncabezadoUsuario.jsx'
const iconCarrito = '/img/icon_carrito.png'
const facebook = '/img/facebook.png'
const twitter = '/img/twitter.png'
const instagram = '/img/instagram.webp'

// GUÍA: Formatea un importe para mostrarlo en la interfaz.
function formatoPrecio(precio) {
  return '$' + Number(precio).toLocaleString('es-CL')
}

// ========================================
// PRODUCTOS ORIGINALES DE VICK
// ========================================

const productosCaso = [
  {
    "id": "FR001",
    "nombre": "Manzanas Fuji",
    "precio": 1200,
    "stock": 150,
    "unidad": "kilo",
    "plural": "kilos",
    "categoria": "frutas",
    "imagen": "/img/catalogo/FR001.jpeg",
    "descripcion": "Manzanas Fuji crujientes y dulces, cultivadas en el Valle del Maule. Perfectas para meriendas saludables o como ingrediente en postres. Estas manzanas son conocidas por su textura firme y su sabor equilibrado entre dulce y ácido."
  },
  {
    "id": "FR002",
    "nombre": "Naranjas Valencia",
    "precio": 1000,
    "stock": 200,
    "unidad": "kilo",
    "plural": "kilos",
    "categoria": "frutas",
    "imagen": "/img/catalogo/FR002.jpeg",
    "descripcion": "Jugosas y ricas en vitamina C, estas naranjas Valencia son ideales para zumos frescos y refrescantes. Cultivadas en condiciones climáticas óptimas que aseguran su dulzura y jugosidad."
  },
  {
    "id": "FR003",
    "nombre": "Plátanos Cavendish",
    "precio": 800,
    "stock": 250,
    "unidad": "kilo",
    "plural": "kilos",
    "categoria": "frutas",
    "imagen": "/img/catalogo/FR003.jpeg",
    "descripcion": "Plátanos maduros y dulces, perfectos para el desayuno o como snack energético. Estos plátanos son ricos en potasio y vitaminas, ideales para mantener una dieta equilibrada."
  },
  {
    "id": "VR001",
    "nombre": "Zanahorias Orgánicas",
    "precio": 900,
    "stock": 100,
    "unidad": "kilo",
    "plural": "kilos",
    "categoria": "verduras",
    "imagen": "/img/catalogo/VR001.jpeg",
    "descripcion": "Zanahorias crujientes cultivadas sin pesticidas en la Región de O'Higgins. Excelente fuente de vitamina A y fibra, ideales para ensaladas, jugos o como snack saludable."
  },
  {
    "id": "VR002",
    "nombre": "Espinacas Frescas",
    "precio": 700,
    "stock": 80,
    "unidad": "bolsa de 500 g",
    "plural": "bolsas",
    "categoria": "verduras",
    "imagen": "/img/catalogo/VR002.jpeg",
    "descripcion": "Espinacas frescas y nutritivas, perfectas para ensaladas y batidos verdes. Estas espinacas son cultivadas bajo prácticas orgánicas que garantizan su calidad y valor nutricional."
  },
  {
    "id": "VR003",
    "nombre": "Pimientos Tricolores",
    "precio": 1500,
    "stock": 120,
    "unidad": "kilo",
    "plural": "kilos",
    "categoria": "verduras",
    "imagen": "/img/catalogo/VR003.jpeg",
    "descripcion": "Pimientos rojos, amarillos y verdes, ideales para salteados y platos coloridos. Ricos en antioxidantes y vitaminas, estos pimientos añaden un toque vibrante y saludable a cualquier receta."
  },
  {
    "id": "PO001",
    "nombre": "Miel Orgánica",
    "precio": 5000,
    "stock": 50,
    "unidad": "frasco de 500 g",
    "plural": "frascos",
    "categoria": "organicos",
    "imagen": "/img/catalogo/PO001.jpeg",
    "descripcion": "Miel pura y orgánica producida por apicultores locales. Rica en antioxidantes y con un sabor inigualable, perfecta para endulzar de manera natural tus comidas y bebidas."
  },
  {
    "id": "PO003",
    "nombre": "Quinua Orgánica",
    "precio": null,
    "stock": null,
    "unidad": null,
    "categoria": "organicos",
    "imagen": null,
    "descripcion": "Este producto figura en el listado del caso. Su descripción, precio y stock no están especificados en el documento.",
    "pendiente": true
  },
  {
    "id": "PL001",
    "nombre": "Leche Entera",
    "precio": null,
    "stock": null,
    "unidad": null,
    "categoria": "lacteos",
    "imagen": null,
    "descripcion": "Este producto figura en el listado del caso. Su descripción, precio y stock no están especificados en el documento.",
    "pendiente": true
  }
]

// Convierte el inventario compartido al formato que utiliza la tarjeta del catálogo.
// GUÍA: Adapta el inventario al formato visual del catálogo.
function cargarProductosCatalogo() {
  return leerInventario().map(producto => {
    const categoriaNormalizada = String(producto.categoria || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const categoria = ({
      frutas: 'frutas',
      verduras: 'verduras',
      organicos: 'organicos',
      lacteos: 'lacteos',
      despensa: 'despensa',
      hierbas: 'hierbas',
      plantas: 'hierbas',
      otros: 'otros'
    })[categoriaNormalizada] || categoriaNormalizada

    const original = productosCaso.find(item =>
      item.id === producto.codigo || item.nombre.toLowerCase() === producto.nombre.toLowerCase()
    )

    return {
      id: String(producto.codigo || producto.id),
      codigo: producto.codigo || String(producto.id),
      nombre: producto.nombre,
      precio: Number(producto.precio) || 0,
      precioFinal: producto.descuento ? Math.round((Number(producto.precio) || 0) * (1 - (Number(producto.descuentoPorcentaje) || 0) / 100)) : (Number(producto.precio) || 0),
      descuento: Boolean(producto.descuento),
      descuentoPorcentaje: Number(producto.descuentoPorcentaje) || 0,
      stock: Number(producto.stock) || 0,
      unidad: producto.unidad || original?.unidad || 'unidad',
      plural: producto.plural || original?.plural || 'unidades',
      categoria,
      imagen: producto.imagen || original?.imagen || '/img/verduras.webp',
      descripcion: producto.descripcion || original?.descripcion || 'Producto disponible en HuertoHogar.'
    }
  })
}

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

// GUÍA: Catálogo, filtro de categorías, cantidades y acciones de carrito.
function Productos() {
  const { usuario } = useAuth()
  const esVendedor = usuario?.rol === 'vendedor'
  const esCliente = usuario?.rol === 'cliente'
  const esRestringido = esVendedor || esCliente
  // GUÍA: Estado de React: conserva los valores de esta sección y vuelve a renderizar al actualizarlos.
  const [productos, setProductos] = useState(cargarProductosCatalogo)
  const [mensaje, setMensaje] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)
  const [cargandoCatalogo, setCargandoCatalogo] = useState(true)
  const [avisoCatalogo, setAvisoCatalogo] = useState('')
  const [cantidades, setCantidades] = useState({})
  const normalizarCategoria = valor => ({'frutas frescas':'frutas','verduras orgánicas':'verduras','productos orgánicos':'organicos','orgánicos':'organicos','productos lácteos':'lacteos','lácteos':'lacteos','lacteos-y-mas':'lacteos','lacteos y mas':'lacteos','hierbas-y-plantas':'hierbas','hierbas y plantas':'hierbas'}[String(valor || '').toLowerCase()] || String(valor || '').toLowerCase() || '')
  // GUÍA: Estado de React: conserva los valores de esta sección y vuelve a renderizar al actualizarlos.
  const [filtro, setFiltro] = useState(() => normalizarCategoria(new URLSearchParams(location.search).get('categoria')))
  const categorias = {frutas:'Frutas frescas', verduras:'Verduras orgánicas', organicos:'Productos orgánicos', lacteos:'Productos lácteos', despensa:'Despensa', hierbas:'Hierbas y plantas', otros:'Otros'}
  const cantidadDe = id => cantidades[id] || 1
  // Nunca permite cantidades inferiores a uno.
  // GUÍA: Modifica la cantidad seleccionada de un producto.
  function cambiarCantidad(id, cambio) {
    setCantidades(actual => ({ ...actual, [id]: Math.min(productos.find(p => p.id === id).stock || 1, Math.max(1, (actual[id] || 1) + cambio)) }))
  }
  // GUÍA: Estado de React: conserva los valores de esta sección y vuelve a renderizar al actualizarlos.
  const [cantidadCarrito, setCantidadCarrito] = useState(0)

  // GUÍA: Una sola sincronización del catálogo, con protección contra respuestas fuera de orden.
  useEffect(() => {
    let activo = true
    let version = 0
    const cargar = (actualizar = false) => {
      const solicitud = ++version
      setCargandoCatalogo(true)
      consultarCatalogo({ actualizar })
        .then(lista => {
          if (!activo || solicitud !== version) return
          if (!Array.isArray(lista)) throw new Error('Catálogo inválido')
          const normalizar = valor => String(valor || 'otros').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          setProductos(lista.map(p => ({
            id: String(p.codigo || p.id), backendId: p.id, codigo: p.codigo,
            nombre: p.nombre, precio: Number(p.precio) || 0,
            precioFinal: p.descuento ? Math.round((Number(p.precio) || 0) * (1 - (Number(p.descuentoPorcentaje) || 0) / 100)) : (Number(p.precio) || 0),
            descuento: Boolean(p.descuento), descuentoPorcentaje: Number(p.descuentoPorcentaje) || 0,
            stock: Number(p.stock) || 0, unidad: p.unidad || 'unidad', plural: p.plural || 'unidades',
            categoria: normalizarCategoria(normalizar(p.categoria)), imagen: p.imagen || '/img/verduras.webp',
            descripcion: p.descripcion || '', pendiente: Boolean(p.pendiente),
          })))
          setAvisoCatalogo('')
        })
        .catch(() => { if (activo && solicitud === version) setAvisoCatalogo('No se pudo actualizar el catálogo. Se muestran los últimos datos disponibles.') })
        .finally(() => { if (activo && solicitud === version) setCargandoCatalogo(false) })
    }
    const refrescar = () => cargar(true)
    cargar()
    window.addEventListener('inventarioActualizado', refrescar)
    return () => { activo = false; window.removeEventListener('inventarioActualizado', refrescar) }
  }, [])

  // ========================================
  // ACTUALIZAR CONTADOR DEL CARRITO
  // ========================================

  // El contador se obtiene desde MySQL cuando hay sesión y desde el
  // carrito temporal cuando la persona todavía no ha iniciado sesión.
  // GUÍA: Efecto de React: ejecuta la sincronización o suscripción de este bloque según sus dependencias; revisar la limpieza al desmontar.
  useEffect(() => {
    if (esVendedor) return
    let activo = true
    const actualizarContador = async () => {
      try {
        const carrito = await obtenerCarritoActual()
        if (activo) {
          setCantidadCarrito(carrito.reduce(
            (total, item) => total + (Number(item.cantidad) || 1), 0
          ))
        }
      } catch (error) {
        console.warn('No se pudo consultar el carrito:', error.message)
      }
    }

    const refrescar = () => actualizarContador()
    actualizarContador()
    window.addEventListener('carritoActualizado', refrescar)
    window.addEventListener('sesionActualizada', refrescar)

    return () => {
      activo = false
      window.removeEventListener('carritoActualizado', refrescar)
      window.removeEventListener('sesionActualizada', refrescar)
    }
  }, [esVendedor])

  // ========================================
  // FILTRAR POR CATEGORÍA
  // ========================================

  // GUÍA: Recalcula filtros únicamente cuando cambian productos, categoría o búsqueda.
  const productosFiltrados = useMemo(() => filtrarCatalogo(productos, filtro, busqueda), [productos, filtro, busqueda])
  const resultado = useMemo(() => paginarCatalogo(productosFiltrados, pagina), [productosFiltrados, pagina])

  // ========================================
  // AGREGAR PRODUCTOS AL CARRITO
  // ========================================

  // GUÍA: Envía el producto seleccionado al servicio de carrito y muestra el resultado.
  async function agregarAlCarrito(producto) {
    try {
      const cantidad = cantidadDe(producto.id)
      if (producto.pendiente) return

      await agregarProductoAlCarrito(producto, cantidad)
      setMensaje(
        `${cantidad} × ${producto.nombre} agregado al carrito. Total: ${formatoPrecio((producto.precioFinal ?? producto.precio) * cantidad)}.`
      )
    } catch (error) {
      console.error('Error al agregar al carrito:', error)
      setMensaje(error.message || 'No se pudo agregar el producto al carrito.')
    }
  }

  // ========================================
  // CERRAR MENSAJE
  // ========================================

  // GUÍA: Punto de entrada de la operación cerrarMensaje; aquí se concentra su comportamiento.
  function cerrarMensaje() {
    setMensaje('')
  }

  return (
    <>
      {/* BARRA SUPERIOR */}

      <div className="barra-superior"></div>

      {/* =====================================
          ENCABEZADO
      ===================================== */}

      <header className="sitio-header">
        <div className="header-container">

          {/* LOGO */}

          <a className="logo" href="/">
            <img
              src={logo}
              alt="HuertoHogar"
            />
          </a>

          {/* MENÚ DE NAVEGACIÓN */}

          <nav
            className="nav-menu"
            aria-label="Menú principal"
          >
            <ul>
              {!esVendedor && <>
                <li><a href="/">Inicio</a></li>
                <li><a href="/categorias">Categorías</a></li>
              </>}
              <li><a href="/productos">Productos</a></li>
              {esCliente && <li><a href="/mis-pedidos">Mis pedidos</a></li>}
              {!esRestringido && <>
                <li><a href="/nosotros">Nosotros</a></li>
                <li><a href="/blog">Blog</a></li>
                <li><a href="/contacto">Contacto</a></li>
                <li><a href="/impacto">Impacto</a></li>
                <li><a href="/noticias">Noticias</a></li>
              </>}
              {esVendedor && <li><a href="/admin/pedidos">Órdenes y boletas</a></li>}
            </ul>
          </nav>

          {/* ICONOS */}

          <div className="header-icons">

            <EncabezadoUsuario />

            {!esVendedor && <a
              href="/carrito"
              title={`Carrito con ${cantidadCarrito} productos`}
              className="cart-icon"
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center'
              }}
            >
              <img
                src={iconCarrito}
                alt="Carrito"
              />

              {cantidadCarrito > 0 && (
                <b
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-12px',
                    background: '#299457',
                    color: '#fff',
                    borderRadius: '50%',
                    minWidth: '21px',
                    height: '21px',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: '11px',
                    padding: '0 4px'
                  }}
                >
                  {cantidadCarrito}
                </b>
              )}
            </a>}

          </div>
        </div>
      </header>

      {/* =====================================
          CONTENIDO PRINCIPAL
      ===================================== */}

      <main className="hh-catalogo">
        <div className="hh-migas"><a href="/">Inicio</a><span>/</span><span>Productos</span></div>
        <section className="hh-presentacion">
          <div><span className="hh-etiqueta">HUERTOHOGAR · NUESTRA SELECCIÓN</span>
            <h1>Más fresco.<br /><em>Más de lo que te gusta.</em></h1>
            <p>{esVendedor ? 'Consulta el catálogo de productos, sus precios, categorías y disponibilidad.' : 'Encuentra tus favoritos, elige la cantidad y llena tu carrito de sabor.'}</p>
            <a className="hh-explorar" href="#seleccion">Explorar productos <span aria-hidden="true">↗</span></a>
          </div>
          <div className="hh-hero-imagen"><img src={naranja} alt="Naranjas de nuestro catálogo" /><span>Un toque de frescura<br /><strong>para tu día</strong></span></div>
        </section>
        <div className="hh-titulo-lista" id="seleccion"><div><span className="hh-etiqueta">ELIGE TUS FAVORITOS</span><h2>Nuestros productos</h2></div><span>{productosFiltrados.length} productos</span></div>

        {/* MENSAJE DE CONFIRMACIÓN */}

        {mensaje && (
          <div
            role="status"
            style={{
              maxWidth: '650px',
              margin: '20px auto',
              padding: '15px 20px',
              border: '1px solid #b8dfc4',
              borderRadius: '10px',
              backgroundColor: '#effaf1',
              color: '#176a37',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '15px'
            }}
          >
            <span>{mensaje}</span>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              {!esVendedor && <a
                href="/carrito"
                style={{
                  color: '#176a37',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap'
                }}
              >
                Ver carrito
              </a>}

              <button
                type="button"
                onClick={cerrarMensaje}
                aria-label="Cerrar mensaje"
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#176a37',
                  fontSize: '23px',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* LISTADO DE PRODUCTOS */}

        <div className="hh-filtros" role="group" aria-label="Filtrar por categoría">
          {Object.entries({'':'Todos', ...categorias}).map(([valor, texto]) => <button type="button" key={valor} aria-pressed={filtro === valor} onClick={() => { setFiltro(valor); setPagina(1) }}>{texto}</button>)}
        </div>
        <label className="hh-busqueda">Buscar productos
          <input type="search" value={busqueda} placeholder="Nombre o código" onChange={e => { setBusqueda(e.target.value); setPagina(1) }} />
        </label>
        {cargandoCatalogo && <p role="status">Actualizando catálogo…</p>}
        {avisoCatalogo && <p role="status">{avisoCatalogo}</p>}
        <section className="row g-4" aria-label="Catálogo de productos" aria-busy={cargandoCatalogo}>

          {resultado.elementos.map(producto => (
            <div key={producto.id} className="col-12 col-sm-6 col-lg-4 d-flex">
            <article
              className="hh-tarjeta w-100"
              data-categoria={producto.categoria}
            >

              {/* IMAGEN */}

              <div className="hh-foto"><span className="hh-categoria">{categorias[producto.categoria] || producto.categoria}</span>
                {producto.imagen ? <img src={producto.imagen} alt={producto.nombre} loading="lazy" decoding="async" /> : <span className="hh-sin-foto">Fotografía pendiente</span>}
              </div>

              {/* NOMBRE */}

              <div className="hh-contenido"><h2>{producto.nombre}</h2>

              {/* PRECIO */}

              {producto.descuento && !producto.pendiente && <span className="hh-etiqueta-descuento">-{producto.descuentoPorcentaje}% DESCUENTO</span>}
              <p className="hh-precio">
                {producto.pendiente ? 'Por confirmar' : producto.descuento ? <><del>{formatoPrecio(producto.precio)}</del> <strong className="hh-precio-oferta">{formatoPrecio(producto.precioFinal)}</strong></> : formatoPrecio(producto.precio)} <small>{producto.pendiente ? 'Precio pendiente' : `CLP / ${producto.unidad}`}</small>
              </p>

              {/* DESCRIPCIÓN */}

              <p className="hh-descripcion">
                {producto.descripcion}
              </p>

              <p className="hh-stock">{producto.pendiente ? 'Disponibilidad por confirmar' : `Disponible: ${producto.stock} ${producto.plural}`} <small>· {producto.id}</small></p>
              {!esVendedor && !producto.pendiente && <div className="hh-compra">
                <div><span className="hh-label">Cantidad ({producto.plural})</span>
                  <div className="hh-cantidad" role="group" aria-label={`Cantidad de ${producto.nombre}`}>
                    <button type="button" aria-label={`Disminuir ${producto.nombre}`} disabled={cantidadDe(producto.id) === 1} onClick={() => cambiarCantidad(producto.id, -1)}>−</button>
                    <output aria-live="polite">{cantidadDe(producto.id)}</output>
                    <button type="button" aria-label={`Aumentar ${producto.nombre}`} disabled={cantidadDe(producto.id) >= producto.stock} onClick={() => cambiarCantidad(producto.id, 1)}>+</button>
                  </div>
                </div>
                <div className="hh-subtotal"><span className="hh-label">Subtotal</span><strong aria-live="polite">{formatoPrecio((producto.precioFinal ?? producto.precio) * cantidadDe(producto.id))}</strong></div>
              </div>}
              {/* Envía al carrito la cantidad seleccionada. */}

              {!esVendedor && <button
                type="button"
                className="hh-agregar"
                disabled={producto.pendiente}
                onClick={() =>
                  agregarAlCarrito(producto)
                }
              >
                <span aria-hidden="true">{producto.pendiente ? "◷" : "＋"}</span> {producto.pendiente ? "Información pendiente" : "Agregar al carrito"}
              </button>}
              </div>

            </article>
            </div>
          ))}

        </section>

        {resultado.total > 1 && <nav className="hh-paginacion" aria-label="Páginas del catálogo">
          <button type="button" disabled={resultado.actual === 1} onClick={() => setPagina(resultado.actual - 1)}>Anterior</button>
          <span aria-live="polite">Página {resultado.actual} de {resultado.total}</span>
          <button type="button" disabled={resultado.actual === resultado.total} onClick={() => setPagina(resultado.actual + 1)}>Siguiente</button>
        </nav>}

        {/* CATEGORÍA SIN PRODUCTOS */}

        {productosFiltrados.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 20px'
            }}
          >
            <h2>{busqueda ? "Sin resultados" : "Próximamente"}</h2>

            <p>
              {busqueda ? "Prueba con otro nombre o código." : "Todavía no tenemos productos cargados en esta categoría."}
            </p>

            <a href="/productos">
              Ver todos los productos
            </a>
          </div>
        )}

      </main>

      {/* =====================================
          FOOTER
      ===================================== */}

      {!esRestringido && (
      <footer className="sitio-footer">

        {/* LOGO */}

        <div className="footer-logo">
          <img
            src={logo}
            alt="HuertoHogar"
          />
        </div>

        {/* CONTACTO */}

        <div className="footer-column">
          <h3>CONTACTO</h3>

          <ul>
            <li>
              <a href="/contacto">Contacto</a>
            </li>

            <li>
              <a href="/nosotros">Nosotros</a>
            </li>

            <li>
              <a href="/blog">Blog</a>
            </li>

            <li>
              <a href="/pago-envio">
                Pago y envío
              </a>
            </li>
          </ul>
        </div>

        {/* INFORMACIÓN */}

        <div className="footer-column">
          <h3>INFORMACIÓN</h3>

          <ul>
            <li>
              <a href="/categorias">
                Categorías
              </a>
            </li>

            <li>
              <a href="/impacto">
                Impacto ambiental
              </a>
            </li>

            <li>
              <a href="/noticias">
                Noticias
              </a>
            </li>

            <li>
              <a href="/admin/usuarios">
                Acceso administrativo
              </a>
            </li>
          </ul>
        </div>

        {/* REDES SOCIALES */}

        <div className="footer-column">
          <h3>REDES SOCIALES</h3>

          <div className="social-icons">

            <img
              src={facebook}
              alt="Facebook"
              className="social-img"
            />

            <img
              src={twitter}
              alt="Twitter"
              className="social-img"
            />

            <img
              src={instagram}
              alt="Instagram"
              className="social-img"
            />

          </div>

          <p>
            @HuertoHogar · Región de Valparaíso, Chile
          </p>

          <p>info@huertohogar.cl</p>
        </div>

      </footer>
      )}
    </>
  )
}

export default Productos
