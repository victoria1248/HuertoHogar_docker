# HuertoHogar — Frontend

Frontend React + Vite. Para ejecutar en desarrollo:

1. Instalar Node.js/npm.
2. Copiar `.env.example` a `.env` si se requiere cambiar la URL.
3. Mantener `VITE_API_URL=http://localhost:8080` para el backend local.
4. Ejecutar `npm install`.
5. Ejecutar `npm run dev` y abrir `http://localhost:5173`.

El frontend utiliza `fetch` mediante `src/servicios/api.js` y consume rutas `/api/v1`. Las sesiones guardan el token de acceso en `sessionStorage`.

Repositorio público frontend: [PEGAR URL]
