// GUÍA: Define la pantalla Categorias y su contenido visible.

import React, { useEffect, useState } from 'react'
import { apiRequest } from '../../servicios/api.js'
import { useAuth } from '../../context/AuthContext.jsx'

import '../../css/tienda/comun.css'
import '../../css/tienda/categorias.css'
import '../../css/tienda/responsive.css'

const logo = '/img/Logo_2.png'
const cesta = '/img/cesta de verduras.webp'
const frutas = '/img/Frutas.webp'
const verduras = '/img/verduras.webp'
const organicos = '/img/Organico.webp'
const lacteos = '/img/Lacteos.webp'
const despensa = '/img/Despensa.webp'
const hierbas = '/img/Herbas.webp'

import EncabezadoUsuario from '../../componentes/tienda/EncabezadoUsuario.jsx'
const iconCarrito = '/img/icon_carrito.png'
const facebook = '/img/facebook.png'
const twitter = '/img/twitter.png'
const instagram = '/img/instagram.webp'

const categoriasBase = [
  {
    nombre: 'Frutas',
    descripcion: 'Lo mejor de la temporada, seleccionado para ti',
    imagen: frutas,
    clase: 'frutas',
    filtro: 'frutas'
  },
  {
    nombre: 'Verduras',
    descripcion: 'Frescas, nutritivas y recién cosechadas',
    imagen: verduras,
    clase: 'verduras',
    filtro: 'verduras'
  },
  {
    nombre: 'Orgánicos',
    descripcion: 'Productos libres de químicos, 100% naturales',
    imagen: organicos,
    clase: 'organicos',
    filtro: 'organicos'
  },
  {
    nombre: 'Lácteos y más',
    descripcion: 'Productos lácteos, huevos y más del campo',
    imagen: lacteos,
    clase: 'lacteos',
    filtro: 'lacteos'
  },
  {
    nombre: 'Despensa',
    descripcion: 'Todo lo que necesitas para tu día a día',
    imagen: despensa,
    clase: 'despensa',
    filtro: 'despensa'
  },
  {
    nombre: 'Hierbas y plantas',
    descripcion: 'Aromáticas medicinales y para tu hogar',
    imagen: hierbas,
    clase: 'hierbas',
    filtro: 'hierbas'
  }
]

// GUÍA: Define el componente o clase Categorias y reúne su comportamiento principal.
function Categorias() {
  const { usuario } = useAuth()
  const esVendedor = usuario?.rol === 'vendedor'
  const esCliente = usuario?.rol === 'cliente'
  const esRestringido = esVendedor || esCliente
  // GUÍA: Estado de React: conserva los valores de esta sección y vuelve a renderizar al actualizarlos.
  const [categorias, setCategorias] = useState(categoriasBase)

  // GUÍA: Efecto de React: ejecuta la sincronización o suscripción de este bloque según sus dependencias; revisar la limpieza al desmontar.
  useEffect(() => {
    let activo = true
    apiRequest('/api/v1/categorias')
      .then(lista => {
        if (!activo || !Array.isArray(lista) || lista.length === 0) return
        const normalizar = valor => String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-')
        const actualizadas = lista.map(item => {
          const slug = item.slug || normalizar(item.nombre)
          const clave = slug === 'lacteos-y-mas' ? 'lacteos' : slug === 'hierbas-y-plantas' ? 'hierbas' : slug
          const base = categoriasBase.find(c => c.filtro === clave) || categoriasBase.find(c => c.filtro === 'organicos')
          return { ...base, nombre: item.nombre, descripcion: item.descripcion || base.descripcion, imagen: item.imagen || base.imagen, filtro: slug }
        })
        setCategorias(actualizadas)
      })
      .catch(error => console.warn('No se pudieron cargar las categorías desde MySQL:', error.message))
    return () => { activo = false }
  }, [])

  return (
    <div className="pagina">

      {/* ENCABEZADO ORIGINAL */}
      <header className="sitio-header">
        <div className="header-container d-flex flex-wrap align-items-center justify-content-between gap-3">
          <a className="logo" href="/">
            <img src={logo} alt="HuertoHogar" />
          </a>

          <nav className="nav-menu" aria-label="Menú principal">
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
                <li><a href="/resenas">Reseñas</a></li>
              </>}
            </ul>
          </nav>

          <div className="header-icons d-flex align-items-center gap-3">
            <EncabezadoUsuario />

            {!esVendedor && <a href="/carrito" title="Carrito"><img src={iconCarrito} alt="Carrito" /></a>}
          </div>
        </div>
      </header>

      <main>

        {/* PRESENTACIÓN DE CATEGORÍAS */}
        <section className="cabecera-categorias d-flex flex-wrap align-items-center">
          <div>
            <p className="ruta mb-2">
              <a href="/">Inicio</a> &gt; Categorías
            </p>

            <h1>Categorías</h1>

            <p>
              Explora nuestras categorías y encuentra los productos
              <br />
              más frescos y naturales, directamente del campo a tu casa.
            </p>
          </div>

          <img
            src={cesta}
            alt="Frutas y verduras frescas"
          />
        </section>

        {/* TARJETAS ORIGINALES */}
        <section
          className="categorias"
          aria-label="Categorías de productos"
        >
          {categorias.map((categoria) => (
            <article className="tarjeta d-flex flex-column h-100" key={categoria.filtro}>
              <div className={`foto ${categoria.clase}`}>
                <img
                  src={categoria.imagen}
                  alt={categoria.nombre}
                />
              </div>

              <h3>{categoria.nombre}</h3>

              <p>{categoria.descripcion}</p>

              <a className="mt-auto d-inline-block" href={`/productos?categoria=${categoria.filtro}`}>
                Consultar productos →
              </a>
            </article>
          ))}
        </section>

        {/* DEL CAMPO A TU HOGAR */}
        <section className="campo-hogar d-flex flex-wrap align-items-center gap-3">
          <span className="hoja">
            <i
              className="fa-solid fa-seedling"
              aria-hidden="true"
            />
          </span>

          <div>
            <h2>Del campo a tu hogar</h2>
            <p>
              Trabajamos con agricultores locales para llevarte
              productos frescos,
              <br />
              sostenibles y de la más alta calidad.
            </p>
          </div>

          {!esCliente && <a className="boton" href="/nosotros">
            Conoce más sobre nosotros →
          </a>}
        </section>

        {/* BENEFICIOS */}
        <section
          className="beneficios"
          aria-label="Nuestros beneficios"
        >
          <article>
            <i className="fa-solid fa-leaf" aria-hidden="true" />
            <div>
              <h3>Productos frescos</h3>
              <p>Directo del campo</p>
            </div>
          </article>

          <article>
            <i className="fa-solid fa-truck" aria-hidden="true" />
            <div>
              <h3>Envíos a todo Chile</h3>
              <p>Rápidos y seguros</p>
            </div>
          </article>

          <article>
            <i
              className="fa-solid fa-shield-halved"
              aria-hidden="true"
            />
            <div>
              <h3>100% naturales</h3>
              <p>Sin químicos añadidos</p>
            </div>
          </article>

          <article>
            <i className="fa-regular fa-heart" aria-hidden="true" />
            <div>
              <h3>Apoyamos lo local</h3>
              <p>Agricultores chilenos</p>
            </div>
          </article>
        </section>
      </main>

      {/* FOOTER ORIGINAL */}
      {!esRestringido && (
      <footer className="sitio-footer">
        <div className="footer-logo">
          <a href="/">
            <img src={logo} alt="HuertoHogar" />
          </a>
        </div>

        <div className="footer-column">
          <h3>CONTACTO</h3>
          <ul>
            <li><a href="/nosotros">Nosotros</a></li>
            <li><a href="/blog">Blog</a></li>
            <li><a href="/contacto">Contáctanos</a></li>
            <li><a href="/pago-envio">Pago y envío</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>INFORMACIÓN</h3>
          <ul>
            <li><a href="/categorias">Categorías</a></li>
            <li><a href="/impacto">Impacto ambiental</a></li>
            <li><a href="/noticias">Noticias</a></li>
            <li>
              <a href="/admin/usuarios">Acceso administrativo</a>
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>REDES SOCIALES</h3>

          <div className="social-icons d-flex flex-wrap align-items-center gap-2">
            <img
              src={facebook}
              alt="Facebook"
              className="social-img img-fluid"
            />
            <img
              src={twitter}
              alt="Twitter"
              className="social-img img-fluid"
            />
            <img
              src={instagram}
              alt="Instagram"
              className="social-img img-fluid"
            />
          </div>

          <p>@HuertoHogar · Región de Valparaíso, Chile</p>

          <p>
            <a href="mailto:info@huertohogar.cl">
              info@huertohogar.cl
            </a>
          </p>
        </div>
      </footer>
      )}
    </div>
  )
}

export default Categorias
