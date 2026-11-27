# image

Funciones de integración con servicios externos de imágenes (p. ej. Cloudinary).

## Alcance

- Subida de imágenes y helpers relacionados a providers externos.
- Reglas puras de firma de subida (`cloudinary-sign.ts`).

## Qué se permite agregar

- Wrappers para SDKs/REST de proveedores de imágenes.
- Validación de configuración necesaria (env vars) y errores de integración.

## Qué NO se permite agregar

- Lógica del dominio (Solution/Diagram).
- Lógica de UI.

## Subida firmada (Cloudinary)

El `api_secret` **no** se expone al navegador. El flujo es:

1. `uploadImage` pide la firma a `POST /api/cloudinary/sign` (misma origen; viaja
   la cookie httpOnly `access_token`, sin ella la ruta responde 401).
2. La ruta valida los params en el servidor (`public_id` + `folder` opcional),
   firma con SHA-1 según el spec de Cloudinary y devuelve
   `{ signature, timestamp, api_key, cloud_name, params }`.
3. El navegador sube los bytes **directo** a Cloudinary con esos params: ninguna
   imagen pasa por el servidor de Next.

`cloudinary-sign.ts` importa `node:crypto`, así que **no** debe re-exportarse
desde `index.ts` (lo consume sólo el route handler, server-side).

Variables de entorno:

- Públicas (cliente): `NEXT_PUBLIC_CLOUDINARY_URL` (incluye el cloud name),
  `NEXT_PUBLIC_CLOUDINARY_API_KEY`.
- Sólo servidor: `CLOUDINARY_API_SECRET`.

## Ejemplo

```ts
import { uploadImage } from "@fsd/shared/lib/image";

const secureUrl = await uploadImage(dataUrl, solutionId);
```
