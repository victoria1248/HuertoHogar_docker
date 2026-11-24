// GUÍA: Pruebas de rendimiento funcional sin dependencias ni Docker.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { consultarCatalogo } from '../src/servicios/catalogoApi.js'
import { filtrarCatalogo, paginarCatalogo } from '../src/datos/paginacionCatalogo.js'
import { apiRequest, CLAVE_TOKEN } from '../src/servicios/api.js'
import { readFileSync, existsSync } from 'node:fs'
const productos = Array.from({length: 25}, (_, i) => ({ id: i+1, codigo: `FR${i+1}`, nombre: i===0 ? 'Plátano' : `Producto ${i+1}`, categoria: i%2===0 ? 'frutas':'verduras' }))
function preparar(token = 'token') {
  const datos = new Map([[CLAVE_TOKEN, token], ['sesion_huerto', '{}']])
  globalThis.sessionStorage = { getItem: k => datos.get(k) ?? null, removeItem: k => datos.delete(k) }
  globalThis.localStorage = { removeItem() {} }
  globalThis.window = new EventTarget()
  return datos
}
test('Búsqueda por nombre sin distinguir acentos ni mayúsculas', () => {
  assert.deepEqual(filtrarCatalogo(productos, '', ' PLATANO '), [productos[0]])
})
test('Combina categoría y código', () => {
  assert.deepEqual(filtrarCatalogo(productos, 'frutas', 'FR25'), [productos[24]])
  assert.deepEqual(filtrarCatalogo(productos, 'verduras', 'FR25'), [])
})
test('Paginación muestra 12, 12 y 1 sin perder productos', () => {
  const paginas = [1,2,3].map(p => paginarCatalogo(productos,p))
  assert.deepEqual(paginas.map(p=>p.elementos.length), [12,12,1])
  assert.deepEqual(paginas.flatMap(p=>p.elementos), productos)
})
test('Paginación se ajusta al reducir el catálogo y permite lista vacía', () => {
  assert.equal(paginarCatalogo(productos.slice(0,3), 4).actual,1)
  assert.deepEqual(paginarCatalogo([],1),{elementos:[],actual:1,total:1})
})
test('Dos lecturas simultáneas comparten una petición pública, las siguientes son nuevas', async () => {
  preparar(); let llamadas=0
  globalThis.fetch = async (_, config) => { llamadas++; assert.equal(config.headers.Authorization, undefined); return new Response('[]') }
  const a=consultarCatalogo(), b=consultarCatalogo()
  assert.equal(a,b); await Promise.all([a,b]); assert.equal(llamadas,1)
  await consultarCatalogo(); assert.equal(llamadas,2)
})
test('Actualizar inventario inicia solicitud nueva sin que la anterior borre la nueva', async () => {
  preparar(); const respuestas=[]
  globalThis.fetch = () => new Promise(resolve=>respuestas.push(resolve))
  const a=consultarCatalogo(), b=consultarCatalogo({actualizar:true})
  assert.notEqual(a,b); respuestas[0](new Response('[]')); await a
  assert.equal(consultarCatalogo(),b)
  respuestas[1](new Response('[{"stock":8}]')); assert.deepEqual(await b,[{stock:8}])
})
test('Si falla el catálogo, la siguiente consulta puede reintentar', async () => {
  preparar(); globalThis.fetch = async () => { throw new Error('red') }
  await assert.rejects(consultarCatalogo(), /No se pudo conectar/)
  globalThis.fetch = async () => new Response('[]'); assert.deepEqual(await consultarCatalogo(),[])
})
test('Un 401 atrasado no borra un token nuevo', async () => {
  const datos=preparar('anterior'); let responder
  globalThis.fetch = () => new Promise(resolve=>{responder=resolve})
  const solicitud=apiRequest('/api/v1/auth/me'); datos.set(CLAVE_TOKEN,'nuevo')
  responder(new Response('{"error":"Expirado"}',{status:401}))
  await assert.rejects(solicitud,/Expirado/); assert.equal(datos.get(CLAVE_TOKEN),'nuevo')
})
test('Todas las rutas de imágenes anteriores tienen un WebP y regla de Nginx', () => {
  const mapa=JSON.parse(readFileSync(new URL('../imagenes-optimizadas.json',import.meta.url)))
  const nginx=readFileSync(new URL('../nginx.conf',import.meta.url),'utf8')
  for(const [vieja,nueva] of Object.entries(mapa)) {
    assert.ok(existsSync(new URL('../public'+nueva,import.meta.url)),nueva)
    assert.ok(nginx.includes(`location = "${vieja}"`),vieja)
  }
})
