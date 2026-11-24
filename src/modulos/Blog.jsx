// GUÍA: Organiza las pantallas y navegación de este módulo.
import { Routes, Route, Outlet } from 'react-router-dom'

import Cabecera from '../componentes/blog/Cabecera.jsx'
import Footer from '../componentes/blog/Footer.jsx'

import Recetas from '../pages/blog/Recetas.jsx'
import ConsejosCultivo from '../pages/blog/ConsejosCultivo.jsx'
import Blog from '../pages/blog/Blog.jsx'

import '../css/blog/comun.css'
import '../css/blog/estilos.css'
import '../css/blog/categorias.css'
import '../css/blog/blog.css'
import '../css/blog/responsive.css'

// GUÍA: Define el componente o clase EstructuraTienda y reúne su comportamiento principal.
function EstructuraTienda() {
    return (
        <div className="pagina">
            <Cabecera />
            <Outlet />
            <Footer />
        </div>
    )
}

// GUÍA: Define el componente o clase App y reúne su comportamiento principal.
function App() {
    return (
        <>
            <Routes>
                {/* Páginas con cabecera y footer */}
                <Route element={<EstructuraTienda />}>

                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/recetas" element={<Recetas />} />
                    <Route
                        path="/blog/consejos"
                        element={<ConsejosCultivo />}
                    />
                </Route>


            </Routes>
        </>
    )
}

export default App