// GUÍA: Organiza las pantallas y navegación de este módulo.
import { useEffect, useState } from "react";
import { obtenerCarritoActual } from '../servicios/carritoApi.js';
import { Routes, Route, NavLink, Link, Navigate } from "react-router-dom";
import Contacto from "../pages/informacion/contactos.jsx";
import Impacto from "../pages/informacion/impacto.jsx";
import Noticias from "../pages/informacion/noticias.jsx";
import Resenas from "../pages/informacion/Resenas.jsx";
import Nosotros from "../pages/informacion/nosotros.jsx";
import Footer from "../pages/informacion/Footer.jsx";
import "../css/informacion/app.css";

// GUÍA: Define el componente o clase Cabecera y reúne su comportamiento principal.
function Cabecera({ cantidad }) {
  const enlaces = [
    ["Inicio", "/"],
    ["Categorías", "/categorias"],
    ["Blog", "/blog"],
    ["Productos", "/productos"],
    ["Carrito", "/carrito"],
    ["Nosotros", "/nosotros"],
    ["Noticias", "/noticias"],
    ["Impacto ambiental", "/impacto"],
    ["Reseñas", "/resenas"],
    ["Contacto", "/contacto"],
  ];
  return (
    <header className="cabecera">
      <Link to="/" className="marca" aria-label="HuertoHogar - Productos">
        <img src="/img/logo-principal.png" alt="" onError={e => { e.currentTarget.src = "/img/logo_1.webp"; }} />
        <span>HuertoHogar</span>
      </Link>
      <nav aria-label="Navegación principal">
        {enlaces.map(([nombre, ruta]) => (
          <NavLink key={ruta} to={ruta} className={({ isActive }) => isActive ? "nav-enlace activo" : "nav-enlace"}>
            {nombre}
          </NavLink>
        ))}
        {cantidad > 0 && <span className="nav-enlace" aria-live="polite">🛒 Agregados: {cantidad}</span>}
      </nav>
    </header>
  );
}


// GUÍA: Define el componente o clase Aplicacion y reúne su comportamiento principal.
function Aplicacion() {
  // GUÍA: Estado de React: conserva los valores de esta sección y vuelve a renderizar al actualizarlos.
  const [cantidad, setCantidad] = useState(0);

  // GUÍA: Efecto de React: ejecuta la sincronización o suscripción de este bloque según sus dependencias; revisar la limpieza al desmontar.
  useEffect(() => {
    let activo = true;
    const actualizarCantidad = async () => {
      try {
        const carrito = await obtenerCarritoActual();
        if (activo) {
          setCantidad(carrito.reduce((total, producto) => total + (Number(producto.cantidad) || 1), 0));
        }
      } catch (error) {
        console.warn('No se pudo actualizar el contador del carrito:', error.message);
      }
    };
    actualizarCantidad();
    window.addEventListener('carritoActualizado', actualizarCantidad);
    window.addEventListener('sesionActualizada', actualizarCantidad);
    return () => {
      activo = false;
      window.removeEventListener('carritoActualizado', actualizarCantidad);
      window.removeEventListener('sesionActualizada', actualizarCantidad);
    };
  }, []);

  return (
    <>
      <div className="sitio">
        <Cabecera cantidad={cantidad} />
        <Routes>


          <Route path="/nosotros" element={<Nosotros />} />

          <Route path="/contacto" element={<Contacto />} />
          <Route path="/resenas" element={<Resenas />} />
          <Route path="/noticias" element={<Noticias />} />
          <Route path="/impacto" element={<Impacto />} />

          <Route path="*" element={<Navigate to="/productos" replace />} />
        </Routes>
        <Footer />
        <div className="copyright">© {new Date().getFullYear()} HuertoHogar · Fresco, local y sostenible</div>
      </div>
    </>
  );
}

export default Aplicacion;
