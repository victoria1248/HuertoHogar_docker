// GUÍA: Formulario de registro de nuevos usuarios.


import { useState } from 'react'
import { apiRequest } from '../../servicios/api.js'

import '../../css/tienda/base.css'

import '../../css/tienda/izquierda.css'

import '../../css/tienda/formulario.css'

import '../../css/tienda/botones.css'

import '../../css/tienda/responsive.css'

import '../../css/tienda/login-react.css'

// GUÍA: Formulario de registro de nuevos usuarios.
function Registro() {

  // GUÍA: Estado de React: conserva los valores de esta sección y vuelve a renderizar al actualizarlos.
  const [nombre, setNombre] = useState('')

  // GUÍA: Estado de React: conserva los valores de esta sección y vuelve a renderizar al actualizarlos.
  const [edad, setEdad] = useState('')

  // GUÍA: Estado de React: conserva los valores de esta sección y vuelve a renderizar al actualizarlos.
  const [correo, setCorreo] = useState('')

  // GUÍA: Estado de React: conserva los valores de esta sección y vuelve a renderizar al actualizarlos.
  const [password, setPassword] = useState('')

  // GUÍA: Estado de React: conserva los valores de esta sección y vuelve a renderizar al actualizarlos.
  const [confirmar, setConfirmar] = useState('')

  // GUÍA: Estado de React: conserva los valores de esta sección y vuelve a renderizar al actualizarlos.
  const [errores, setErrores] = useState({})

  // GUÍA: Estado de React: conserva los valores de esta sección y vuelve a renderizar al actualizarlos.
  const [mostrarPassword, setMostrarPassword] = useState(false)

  // GUÍA: Estado de React: conserva los valores de esta sección y vuelve a renderizar al actualizarlos.
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false)

  // GUÍA: Procesa los datos ingresados en el formulario de registro.
  async function manejarRegistro(e) {
    e.preventDefault()
    const nuevosErrores = {}
    const nombreValor = nombre.trim()
    const edadValor = Number(edad)
    const correoValor = correo.trim().toLowerCase()
    if (nombreValor.length < 3) nuevosErrores.nombre = 'Ingrese un nombre válido de al menos 3 caracteres.'
    if (edad === '' || !Number.isInteger(edadValor) || edadValor < 18 || edadValor > 100) nuevosErrores.edad = 'Ingrese una edad válida entre 18 y 100 años.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoValor)) nuevosErrores.correo = 'Ingrese un correo electrónico válido.'
    if (password.length < 8) nuevosErrores.password = 'La contraseña debe tener al menos 8 caracteres.'
    if (!confirmar || password !== confirmar) nuevosErrores.confirmar = 'Las contraseñas no coinciden.'
    if (Object.keys(nuevosErrores).length) { setErrores(nuevosErrores); return }

    try {
      // Spring Boot recibe la contraseña y la guarda usando BCrypt.
      // GUÍA: Utiliza la misma conexión REST que el resto de la aplicación, sin requerir sesión.
      await apiRequest('/api/v1/auth/registro', {
        method: 'POST', auth: false,
        body: JSON.stringify({ nombre: nombreValor, edad: edadValor, correo: correoValor, password }),
      })
      alert('Cuenta creada correctamente. Ahora puedes iniciar sesión.')
      window.location.href = '/login' + window.location.search
    } catch (error) {
      setErrores({ correo: error.message || 'No se pudo conectar con el servidor.' })
    }
  }

  return (

    <div className="contenedor-pantalla container-fluid p-0">

      {/* SECCIÓN IZQUIERDA */}

      <div className="seccion-izquierda">

        <div className="superposicion-gradiente"></div>

      </div>

      {/* SECCIÓN DERECHA */}

      <div className="seccion-derecha">

        <div className="tarjeta-formulario w-100">

          <p className="texto-cambiar-form text-center">

            <a href="/">

              ← Volver al inicio

            </a>

          </p>

          <form

            id="form-registro"

            className="formulario activo d-flex flex-column"

            onSubmit={manejarRegistro}

            noValidate

          >

            {/* ENCABEZADO */}

            <div className="encabezado-form">

              <h2 className="titulo-form">

                Crear cuenta

              </h2>

              <p className="descripcion-form">

                Registro de cuenta: crea tu usuario en HuertoHogar.

                El servidor protegerá tu contraseña y guardará tus datos.

              </p>

            </div>

            {/* NOMBRE */}

            <div className="grupo-campo mb-3">

              <label className="etiqueta" htmlFor="reg-nombre">

                Nombre completo

              </label>

              <div className="input-con-icono">

                <input

                  className="form-control"
                  id="reg-nombre"
                  aria-invalid={Boolean(errores.nombre)}

                  type="text"

                  value={nombre}

                  onChange={(e) => setNombre(e.target.value)}

                  autoComplete="name"

                />

              </div>

              <span

                className="mensaje-error"

                id="err-nombre"

                aria-live="polite"

              >

                {errores.nombre || ''}

              </span>

            </div>

            {/* EDAD */}

            <div className="grupo-campo mb-3">

              <label className="etiqueta" htmlFor="reg-edad">

                Edad

              </label>

              <div className="input-con-icono">

                <input

                  className="form-control"
                  id="reg-edad"
                  aria-invalid={Boolean(errores.edad)}

                  type="number"

                  value={edad}

                  onChange={(e) => setEdad(e.target.value)}

                  min="18"

                  max="100"

                />

              </div>

              <span

                className="mensaje-error"

                id="err-edad"

                aria-live="polite"

              >

                {errores.edad || ''}

              </span>

            </div>

            {/* CORREO */}

            <div className="grupo-campo mb-3">

              <label className="etiqueta" htmlFor="reg-correo">

                Correo Gmail

              </label>

              <div className="input-con-icono">

                <input

                  className="form-control"
                  id="reg-correo"
                  aria-invalid={Boolean(errores.correo)}

                  type="email"

                  value={correo}

                  onChange={(e) => setCorreo(e.target.value)}

                  autoComplete="email"

                />

              </div>

              <span

                className="mensaje-error"

                id="err-correo"

                aria-live="polite"

              >

                {errores.correo || ''}

              </span>

            </div>

            {/* CONTRASEÑA */}

            <div className="grupo-campo mb-3">

              <label className="etiqueta" htmlFor="reg-password">

                Contraseña (mínimo 8 caracteres)

              </label>

              <div className="input-con-icono">

                <input

                  className="form-control"
                  id="reg-password"
                  aria-invalid={Boolean(errores.password)}

                  type={mostrarPassword ? 'text' : 'password'}

                  value={password}

                  onChange={(e) => setPassword(e.target.value)}

                  autoComplete="new-password"

                />

                <button

                  type="button"

                  className="btn-toggle-password"

                  onClick={() =>

                    setMostrarPassword(!mostrarPassword)

                  }

                  aria-label={

                    mostrarPassword

                      ? 'Ocultar contraseña'

                      : 'Mostrar contraseña'

                  }

                >

                  {mostrarPassword ? 'Ocultar' : 'Mostrar'}

                </button>

              </div>

              <span

                className="mensaje-error"

                id="err-password"

                aria-live="polite"

              >

                {errores.password || ''}

              </span>

            </div>

            {/* CONFIRMAR CONTRASEÑA */}

            <div className="grupo-campo mb-3">

              <label

                className="etiqueta"

                htmlFor="reg-confirm-password"

              >

                Confirmar contraseña

              </label>

              <div className="input-con-icono">

                <input

                  className="form-control"
                  id="reg-confirm-password"
                  aria-invalid={Boolean(errores.confirmar)}

                  type={mostrarConfirmar ? 'text' : 'password'}

                  value={confirmar}

                  onChange={(e) => setConfirmar(e.target.value)}

                  autoComplete="new-password"

                />

                <button

                  type="button"

                  className="btn-toggle-password"

                  onClick={() =>

                    setMostrarConfirmar(!mostrarConfirmar)

                  }

                  aria-label={

                    mostrarConfirmar

                      ? 'Ocultar confirmación'

                      : 'Mostrar confirmación'

                  }

                >

                  {mostrarConfirmar ? 'Ocultar' : 'Mostrar'}

                </button>

              </div>

              <span

                className="mensaje-error"

                id="err-confirm-pass"

                aria-live="polite"

              >

                {errores.confirmar || ''}

              </span>

            </div>

            {/* BOTÓN CREAR CUENTA */}

            <button type="submit" className="btn-verde btn w-100">

              Crear cuenta

            </button>

            {/* ENLACE LOGIN */}

            <p className="texto-cambiar-form text-center">

              <a href="/login">

                Ya tengo una cuenta

              </a>

            </p>

          </form>

        </div>

      </div>

    </div>

  )

}

export default Registro
