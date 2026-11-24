// GUÍA: Pruebas sin dependencias externas del cliente REST y del almacenamiento de sesión.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { apiRequest, resolverBaseApi, CLAVE_TOKEN, API_BASE_URL } from '../src/servicios/api.js'

function preparar() {
  const datos = new Map([[CLAVE_TOKEN, 'token-de-prueba'], ['sesion_huerto', '{}']])
  globalThis.sessionStorage = { getItem: k => datos.get(k) ?? null, removeItem: k => datos.delete(k) }
  globalThis.localStorage = { removeItem() {} }
  globalThis.window = new EventTarget()
  return datos
}

test('Docker usa el mismo origen y desarrollo mantiene localhost', () => {
  assert.equal(resolverBaseApi(''), '')
  assert.equal(resolverBaseApi(undefined), 'http://localhost:8080')
  assert.equal(resolverBaseApi('https://ejemplo.cl/'), 'https://ejemplo.cl')
})
test('Adjunta Bearer y conserva la ruta REST', async () => {
  preparar()
  globalThis.fetch = async (url, options) => {
    assert.equal(url, `${API_BASE_URL}/api/v1/auth/me`)
    assert.equal(options.headers.Authorization, 'Bearer token-de-prueba')
    return new Response('{"rol":"CLIENTE"}', { status: 200 })
  }
  assert.deepEqual(await apiRequest('/api/v1/auth/me'), { rol: 'CLIENTE' })
})
test('Registro público no envía un JWT anterior', async () => {
  preparar()
  globalThis.fetch = async (_, options) => {
    assert.equal(options.headers.Authorization, undefined)
    assert.equal(options.method, 'POST')
    return new Response('{}', { status: 201 })
  }
  await apiRequest('/api/v1/auth/registro', { auth: false, method: 'POST' })
})
test('Un 401 elimina sesión y emite evento', async () => {
  const datos = preparar()
  let avisado = false
  window.addEventListener('sesionExpirada', () => { avisado = true })
  globalThis.fetch = async () => new Response('{"error":"Expirado"}', { status: 401 })
  await assert.rejects(apiRequest('/api/v1/auth/me'), /Expirado/)
  assert.equal(datos.has(CLAVE_TOKEN), false)
  assert.equal(datos.has('sesion_huerto'), false)
  assert.equal(avisado, true)
})
test('Un 403 conserva sesión', async () => {
  const datos = preparar()
  globalThis.fetch = async () => new Response('{"error":"Sin permiso"}', { status: 403 })
  await assert.rejects(apiRequest('/api/v1/productos', { method: 'POST' }), /Sin permiso/)
  assert.equal(datos.has(CLAVE_TOKEN), true)
})
test('Un fallo de red no borra sesión', async () => {
  const datos = preparar()
  globalThis.fetch = async () => { throw new Error('Sin red') }
  await assert.rejects(apiRequest('/api/v1/auth/me'), /No se pudo conectar/)
  assert.equal(datos.has(CLAVE_TOKEN), true)
})
