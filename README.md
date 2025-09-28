# Escuela de Idiomas — Landing Page (Astro + Notion)

Landing page estática para dar visibilidad a una **escuela de idiomas**.
El contenido se gestiona en **Notion** y se sincroniza en el build con [Astro](https://astro.build/).
Se despliega fácilmente en **Cloudflare Pages**.

---

## 🚀 Stack técnico

- [Astro](https://astro.build/) → framework estático (output: `dist/`).
- **Notion API** → base de datos de contenido (cursos, profesores, testimonios, contacto).
- **Cloudflare Pages** → hosting estático gratuito.
- **Web3Forms** → backend para formulario de contacto (puede sustituirse por Formspree u otro).

---

## 📦 Instalación y uso local

1. Clonar el repo:

   ```bash
   git clone <repo>
   cd escuela-idiomas-astro
   ```

2.	Instalar dependencias:
```bash
npm install
```

3. Crear archivo .env basado en .env.example:
```env
NOTION_TOKEN=tu_token_de_integracion
NOTION_DB_ID=tu_database_id_con_guiones
```
⚠️ Asegúrate de que la base de datos en Notion esté compartida con la integración (Share → Connections → Connect).

4. Modo desarrollo:
```bash
npm run dev
```
Accede a http://localhost:4321.

5. Build para producción:
```bash
npm run build
```
Genera la carpeta dist/.


## 📂 Estructura del proyecto

```
src/
  components/     # Header, Footer, Hero, etc.
  lib/notion.ts   # Cliente para la API de Notion
  pages/          # index.astro (home)
  styles/         # global.css
public/
  img/            # imágenes estáticas
```

## 🔑 Integración con Notion

- src/lib/notion.ts implementa la lectura de la base.
- Intenta usar /data_sources/:id/query (nuevo API).
- Si la base no expone data_sources, hace fallback a /databases/:id/query.
- Solo trae los items con Status = Publicado.
- Normaliza Type a: course, teacher, testimonial, contact.

Campos importantes en la DB de Notion:
- Básicos: Title, Slug, Status, SEO Description
- Cursos: Price, Duration, Schedule, Level
- Profesores: Role, Languages, Photo URL
- Contacto: Phone, Email, Direccion

## 🌐 Despliegue en Cloudflare Pages

1. Conecta el repo a Cloudflare Pages.
2. Configuración:
   - Build command: npm run build
   - Output directory: dist
   - Environment variables:
   - NOTION_TOKEN
   - NOTION_DB_ID
   - (opcional) NODE_VERSION=20
3. Deploy y acceso en <project>.pages.dev.

## 📋 Notas de desarrollo

- Siempre valida que en Notion los items tengan Slug único.
- Para el contacto, usa slug contact o contacto.
- Para imágenes, lo más estable es subirlas a public/img/ y referenciarlas con /img/... en Notion.
- El formulario de contacto usa Web3Forms: sustituir access_key en index.astro.
- Si no aparece contenido:
- Verifica que el campo Status sea Publicado.
- Revisa logs de build para errores de API de Notion.

## 🛠️ Próximos pasos

- Añadir páginas de detalle para cada curso (/courses/[slug]).
- Crear página de listado general de cursos (/courses/).
- Integrar metadatos SEO dinámicos desde Notion.
- Añadir slider de testimonios.
- Internacionalización (i18n) si se requiere.

