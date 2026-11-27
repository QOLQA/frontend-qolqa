# Deployment en VPS con Dockploy (arquitectura BFF)

Desde la migración BFF, el navegador **nunca habla directo con el backend**: todo el tráfico pasa por el servidor Next.js. Esto permite aislar el backend en la red interna de Docker.

```
Browser ──► Next.js (proxy /api/* + server actions) ──► Backend (red interna)
         └─► Cloudinary (upload directo con firma emitida por el servidor)
```

## Red interna (producción)

- El contenedor del backend **no publica puerto** hacia internet. Solo el de Next.js queda expuesto.
- Next alcanza al backend por el hostname interno del servicio, p. ej. `BACKEND_URL=http://dbcapibara-api:8000`.
- CORS deja de importar: no hay peticiones cross-origin desde el browser, y las llamadas server→backend no pasan por CORS.

> En desarrollo local (`compose.yaml`) el puerto `8000` sigue publicado para abrir la documentación del backend (Swagger) desde el navegador. No lo publiques en producción.

## Variables de entorno

### Server-only (solo en el contenedor Next, nunca en el bundle)

| Variable | Uso |
|---|---|
| `BACKEND_URL` | URL interna del backend para el proxy `/api/*`, server actions y server components |
| `CLOUDINARY_API_SECRET` | Firma de uploads en `POST /api/cloudinary/sign` |

### Públicas (`NEXT_PUBLIC_`, van al bundle — no son secretos)

| Variable | Uso |
|---|---|
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Login con Google |
| `NEXT_PUBLIC_CLOUDINARY_URL` | Endpoint de upload de Cloudinary (de él se deriva el cloud name) |
| `NEXT_PUBLIC_CLOUDINARY_API_KEY` | Se devuelve junto a la firma; Cloudinary la espera junto al signature |

Eliminadas (ya no las lee el código): `NEXT_PUBLIC_BACKEND_URL`, `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`, `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET_2`, `NEXT_PUBLIC_CLOUDINARY_API_SECRET`.

## Checklist de deploy

1. En Dockploy, crea una red interna compartida entre los contenedores de Next y backend; quita el puerto publicado del backend.
2. Configura `BACKEND_URL` con el hostname interno del backend en el entorno del contenedor Next.
3. Agrega `CLOUDINARY_API_SECRET` al entorno del contenedor Next.
4. **Rota el api_secret de Cloudinary** (Console → Settings → Access Keys) al momento de deployar esta versión: el secret anterior viajaba en el bundle JS del navegador. Actualiza el valor en Dockploy.
5. Verifica en el navegador que no queden referencias a la URL del backend ni al secret en el bundle (DevTools → Sources, buscar `8000` / `cloudinary_api_secret`).
6. Autenticación: el JWT vive solo en la cookie `access_token` `httpOnly`; no se sincroniza con `localStorage`.
