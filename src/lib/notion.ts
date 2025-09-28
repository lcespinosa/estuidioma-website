// src/lib/notion.ts
// Enfoque con fetch nativo + helpers (como el que ya te funcionaba)

const NOTION_TOKEN = import.meta.env.NOTION_API_KEY as string;         // o NOTION_TOKEN si lo prefieres
const NOTION_DB_ID = import.meta.env.NOTION_DATABASE_ID as string;
const NOTION_VER = import.meta.env.NOTION_VERSION || "2022-06-28";     // versión estable que funciona bien

// ============ Helpers HTTP ============
async function notionGet(path: string) {
  const r = await fetch(`https://api.notion.com/v1/${path}`, {
    headers: {
      "Authorization": `Bearer ${NOTION_TOKEN}`,
      "Notion-Version": NOTION_VER,
      "Content-Type": "application/json",
    },
  });
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`); // <-- esto es solo para el error
  return r.json(); // 👈 nunca conviertas a text() aquí
}

async function notionPost(path: string, body: any) {
  const r = await fetch(`https://api.notion.com/v1/${path}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${NOTION_TOKEN}`,
      "Notion-Version": NOTION_VER,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  return r.json(); // 👈 JSON también
}

// Detecta si el DB tiene data_source (vistas enlazadas) o se consulta por /databases/:id/query
async function getQueryMode(databaseId: string): Promise<
  | { mode: "data_source"; id: string }
  | { mode: "database"; id: string }
> {
  const db = await notionGet(`databases/${databaseId}`);
  const ds = db?.data_sources?.[0]?.id;
  if (ds) return { mode: "data_source", id: ds };
  return { mode: "database", id: databaseId };
}

// ============ Helpers de lectura de props ============
const getText = (p: any) =>
  p?.rich_text?.map((t: any) => t.plain_text).join("") ?? "";
const getTitle = (p: any) =>
  p?.title?.map((t: any) => t.plain_text).join("") ?? "";
const getUrl = (p: any) => p?.url || getText(p) || "";
const getNumber = (p: any) => (typeof p?.number === "number" ? p.number : "");
const getSelect = (p: any) => p?.select?.name ?? "";
const getStatus = (p: any) => p?.status?.name ?? p?.select?.name ?? "";
const getFilesFirstUrl = (p: any) =>
  p?.files?.[0]?.file?.url || p?.files?.[0]?.external?.url || "";

// Mapeo uniforme a tu shape
const mapPage = (page: any) => {
  const props = page.properties || {};
  return {
    id: page.id,
    type: getSelect(props.type) || getText(props.Type),
    title: getText(props.title),
    slug: getText(props.slug),
    status: getStatus(props.status),
    seoDescription: getText(props["seoDescription"]) || getText(props.seoDescription),
    body: getText(props.body),
    features: getText(props.features),
    price: getText(props.price) || "",
    duration: getText(props.duration) || "",
    schedule: getText(props.schedule) || "",
    level: getText(props.level) || "",
    teacher: getText(props.teacher) || "",
    role: getText(props.role) || "",
    languages: getText(props.languages) || "",
    photo: getUrl(props.photo) || getFilesFirstUrl(props.photo) || "",
    rating: getNumber(props.rating) || "",
    phone: getText(props.phone) || "",
    email: getText(props.email) || "",
    address: getText(props.address) || "",
    facebook: getUrl(props.facebook) || "",
    instagram: getUrl(props.instagram) || "",
  };
};

// ============ Query genérico con paginación ============
async function queryAllPublished(databaseId: string) {
  const mode = await getQueryMode(databaseId);

  const baseBody = {
    page_size: 100,
    filter: {
      property: "status",
      select: { equals: "Published" },
    },
    sorts: [{ property: "title", direction: "ascending" }],
  };

  const results: any[] = [];
  let has_more = true;
  let cursor: string | undefined;

  while (has_more) {
    const body = { ...baseBody, start_cursor: cursor };
    let resp;

    if (mode.mode === "data_source") {
      // Endpoint para vistas enlazadas (si tu DB expone data_sources)
      resp = await notionPost(`data_sources/${mode.id}/items`, body);
    } else {
      // Endpoint estándar de bases de datos
      resp = await notionPost(`databases/${mode.id}/query`, body);
    }

    results.push(...(resp.results || []));
    has_more = !!resp.has_more;
    cursor = resp.next_cursor || undefined;
  }

  return results;
}

// ============ API pública para tu app ============
export async function fetchSiteData() {
  const raw = await queryAllPublished(NOTION_DB_ID);
  const items = raw.map(mapPage);

  // Segmentación por type
  const courses = items.filter(i => i.type === "course");
  const teachers = items.filter(i => i.type === "teacher");
  const features = items.filter(i => i.type === "feature");
  const sections = items.filter(i => i.type === "section");
  const contact = items.find(i => i.type === "contact") || null;

  // Secciones específicas por slug
  const home = sections.find(s => s.slug === "home") || null;
  const claim = sections.find(s => s.slug === "garantia") || null;
  const experiencia = sections.find(s => s.slug === "experiencia-profesionalidad") || null;
  const servicios = sections.find(s => s.slug === "nuestros-servicios") || null;

  return {
    courses,
    teachers,
    features,
    sections,
    home,
    claim,
    experiencia,
    servicios,
    contact,
  };
}