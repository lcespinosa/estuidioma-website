# Escuela de Idiomas – 11ty + Notion (Opción B)

Sitio estático con Eleventy (11ty). El contenido se edita en Notion; un script de **prebuild** convierte las páginas a Markdown y 11ty genera HTML.

## Requisitos
- Node 20+
- Notion Integration (token) con acceso a tu Database

### Variables de entorno
Crea `.env` en local y configura en Cloudflare Pages → Settings → Environment Variables.

NOTION_TOKEN=tu_token_de_integracion
NOTION_DB_ID=tu_database_id

## Esquema de Notion (una sola Database)
Campos sugeridos:
- **Type** (select): `hero`, `feature`, `servicio`, `curso`, `profesor`, `testimonio`, `contacto`, `pagina`
- **Title** (title)
- **Slug** (rich text)
- **Status** (select): `Publicado` | `Borrador`
- **SEO Description** (rich text)
- **Price**, **Duration**, **Schedule**, **Level**, **Teacher** (rich text)
- **Role**, **Languages**, **Photo URL** (url)
- **Rating** (number)
- **Phone**, **Email**, **Direccion**, **Facebook**, **Instagram** (rich/url)
- **Tags** (multi-select)

> Si renombras columnas, ajusta `scripts/sync-notion.mjs`.

## Desarrollo
```bash
npm i
npm run dev
```

Abre http://localhost:8080 (por defecto)

## Build (local)

```bash
npm run build
```

Salida en _site/.

## Despliegue (Cloudflare Pages)
- Build command: npm run build
- Output directory: _site
- Node version: 20
- Env vars: NOTION_TOKEN, NOTION_DB_ID

## Formularios
- Usa Web3Forms / Formspree. Reemplaza REEMPLAZA_CON_TU_WEB3FORMS_KEY en contact.njk.