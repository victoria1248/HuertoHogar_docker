// GUÍA: Define la pantalla Blog y su contenido visible.
import PresentacionBlog from '../../componentes/blog/PresentacionBlog.jsx';
import HistoriaBlog from '../../componentes/blog/HistoriaBlog.jsx';
import OpcionesBlog from '../../componentes/blog/OpcionesBlog.jsx';
// GUÍA: Define el componente o clase Blog y reúne su comportamiento principal.
export default function Blog() {
  return <main className="container py-5"><PresentacionBlog /><HistoriaBlog /><OpcionesBlog /></main>;
}
