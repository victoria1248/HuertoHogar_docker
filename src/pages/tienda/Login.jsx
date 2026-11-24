// GUÍA: Pantalla de acceso: recoge credenciales y utiliza el contexto de autenticación.


import { useState } from 'react'

import { useAuth } from '../../context/AuthContext.jsx'

// ========================================*

// CSS ORIGINALES DE HUERTOHOGAR*

// ========================================*

import '../../css/tienda/base.css'

import '../../css/tienda/izquierda.css'

import '../../css/tienda/formulario.css'

import '../../css/tienda/botones.css'

import '../../css/tienda/responsive.css'

import '../../css/tienda/login-react.css'

// ========================================*

// OBTENER CUENTAS GUARDADAS*

// ========================================*

// NORMALIZAR CORREO*

// ========================================*

// GUÍA: Normaliza correo según los datos recibidos.
function normalizarCorreo(correo) {

  return String(correo || '')

    .trim()

    .toLowerCase()

}

// ========================================*

// COMPONENTE LOGIN*

// ========================================*

// GUÍA: Pantalla de acceso: recoge credenciales y utiliza el contexto de autenticación.
function Login() {

  const { iniciarSesion: guardarSesion } = useAuth()

  // GUÍA: Estado de React: conserva los valores de esta sección y vuelve a renderizar al actualizarlos.
  const [correo, setCorreo] = useState('')

  // GUÍA: Estado de React: conserva los valores de esta sección y vuelve a renderizar al actualizarlos.
  const [password, setPassword] = useState('')

  // GUÍA: Estado de React: conserva los valores de esta sección y vuelve a renderizar al actualizarlos.
  const [mostrarPassword, setMostrarPassword] = useState(false)

  // GUÍA: Estado de React: conserva los valores de esta sección y vuelve a renderizar al actualizarlos.
  const [errores, setErrores] = useState({})

  // GUÍA: Estado de React: conserva los valores de esta sección y vuelve a renderizar al actualizarlos.
  const [errorGeneral, setErrorGeneral] = useState('')

  // ========================================*

  // INICIAR SESIÓN*

  // ========================================*

    const iniciarSesion = async (evento) => {
    evento.preventDefault()
    setErrores({})
    setErrorGeneral('')
    const nuevosErrores = {}
    if (!correo.trim()) nuevosErrores.correo = 'Ingrese su correo.'
    if (!password) nuevosErrores.password = 'Ingrese su contraseña.'
    if (Object.keys(nuevosErrores).length) { setErrores(nuevosErrores); return }

    // La API verifica la contraseña; React nunca compara contraseñas guardadas localmente.
    const resultado = await guardarSesion({ correo: normalizarCorreo(correo), password })
    if (!resultado.ok) { setErrorGeneral(resultado.error || 'Correo o contraseña incorrectos.'); return }

    const destinoSolicitado = new URLSearchParams(window.location.search).get('redirigir')
    const destinoSeguro = destinoSolicitado?.startsWith('/') && !destinoSolicitado.startsWith('//') ? destinoSolicitado : null
    window.location.href = resultado.usuario.rol === 'admin' ? '/dashboard' : (destinoSeguro || '/')
  }

// DISEÑO ORIGINAL DEL LOGIN*

  // ========================================*

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

            <a href="/">← Volver al inicio</a>

          </p>

          <form

            id="form-login"

            className="formulario activo d-flex flex-column"

            onSubmit={iniciarSesion}

            noValidate

          >

            <div className="encabezado-form">

              <h2 className="titulo-form">

                ¡Bienvenido de nuevo!

              </h2>

              <p className="descripcion-form">

                Inicia sesión para continuar

              </p>

            </div>

            {/* ERROR GENERAL */}

            {errorGeneral && (

              <div

                id="login-error-general"

                className="alerta-error alert alert-danger"

                role="alert"

              >

                {errorGeneral}

              </div>

            )}

            {/* CORREO ELECTRÓNICO */}

            <div className="grupo-campo mb-3">

              <label

                htmlFor="login-correo"

                className="etiqueta"

              >

                Correo electrónico

              </label>

              <div className="input-con-icono">

                <span className="icono-campo">✉</span>

                <input

                  className="form-control"
                  type="email"

                  id="login-correo"
                  aria-invalid={Boolean(errores.correo)}

                  placeholder="Ingresar tu correo electrónico"

                  value={correo}

                  onChange={(evento) =>

                    setCorreo(evento.target.value)

                  }

                  autoComplete="email"

                />

              </div>

              <span

                className="mensaje-error"

                id="err-login-correo"

              >

                {errores.correo || ''}

              </span>

            </div>

            {/* CONTRASEÑA */}

            <div className="grupo-campo mb-3">

              <label

                htmlFor="login-password"

                className="etiqueta"

              >

                Contraseña

              </label>

              <div className="input-con-icono">

                <span className="icono-campo">🔒</span>

                <input

                  className="form-control"
                  type={mostrarPassword ? 'text' : 'password'}

                  id="login-password"
                  aria-invalid={Boolean(errores.password)}

                  placeholder="Ingresar contraseña"

                  value={password}

                  onChange={(evento) =>

                    setPassword(evento.target.value)

                  }

                  autoComplete="current-password"

                />

                <button

                  type="button"

                  className="btn-toggle-password"

                  aria-label={

                    mostrarPassword

                      ? 'Ocultar contraseña'

                      : 'Mostrar contraseña'

                  }

                  onClick={() =>

                    setMostrarPassword(!mostrarPassword)

                  }

                >

                  {mostrarPassword ? '🙈' : '👁'}

                </button>

              </div>

              <span

                className="mensaje-error"

                id="err-login-password"

              >

                {errores.password || ''}

              </span>

            </div>

            {/* RECUPERAR CONTRASEÑA */}

            <div className="contenedor-olvido">

              <a

                href="/recuperar"

                className="enlace-secundario"

              >

                ¿Olvidaste tu contraseña?

              </a>

            </div>

            {/* BOTÓN INICIAR SESIÓN */}

            <button

              type="submit"

              className="btn-verde btn w-100"

            >

              Iniciar sesión

            </button>

            {/* SEPARADOR */}

            <div className="separador-o">

              <span>o</span>

            </div>

            {/* BOTÓN GOOGLE - PENDIENTE */}

            <button

              type="button"

              className="btn-google btn w-100"

              onClick={() =>

                setErrorGeneral(

                  'El inicio de sesión con Google aún no está configurado.'

                )

              }

            >

              <svg

                width="18"

                height="18"

                viewBox="0 0 24 24"

                aria-hidden="true"

              >

                <path

                  fill="#4285F4"

                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"

                />

                <path

                  fill="#34A853"

                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"

                />

                <path

                  fill="#FBBC05"

                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"

                />

                <path

                  fill="#EA4335"

                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"

                />

              </svg>

              Continuar con Google

            </button>

            {/* REGISTRO */}

            <p className="texto-cambiar-form text-center">

              ¿No tienes cuenta?{' '}

              <a href={`/registro${window.location.search}`}>

                Regístrate aquí

              </a>

            </p>

          </form>

        </div>

      </div>

    </div>

  )

}

export default Login
