import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';

const notion = new Client({ auth: process.env.NOTION_TOKEN, notionVersion: '2025-09-03' });
const n2m = new NotionToMarkdown({ notionClient: notion });

const DB_ID = process.env.NOTION_DB_ID;

// Helpers para propiedades de Notion
const getRichText = (props, key, def = '') =>
    props?.[key]?.rich_text?.[0]?.plain_text ?? def;
const getTitle = (props, key, def = '') =>
    props?.[key]?.title?.[0]?.plain_text ?? def;
const getSelect = (props, key, def = '') =>
    props?.[key]?.select?.name ?? def;
const getMultiSelect = (props, key) =>
    (props?.[key]?.multi_select ?? []).map(x => x.name);
const getNumber = (props, key, def = 0) => {
    const n = props?.[key]?.number;
    return typeof n === 'number' ? n : def;
};
const getUrl = (props, key, def = '') =>
    props?.[key]?.url ?? def;

function mapProps(props) {
    return {
        type: getSelect(props, 'Type'),
        title: getTitle(props, 'Title'),
        slug: getRichText(props, 'Slug'),
        status: getSelect(props, 'Status'),
        seoDescription: getRichText(props, 'SEO Description'),
        // curso
        price: getRichText(props, 'Price'),
        duration: getRichText(props, 'Duration'),
        schedule: getRichText(props, 'Schedule'),
        level: getRichText(props, 'Level'),
        teacher: getRichText(props, 'Teacher'),
        // profesor
        role: getRichText(props, 'Role'),
        languages: getRichText(props, 'Languages'),
        photo: getUrl(props, 'Photo URL'),
        // testimonio
        rating: getNumber(props, 'Rating'),
        // contacto
        phone: getRichText(props, 'Phone'),
        email: getRichText(props, 'Email'),
        address: getRichText(props, 'Address'),
        facebook: getUrl(props, 'Facebook'),
        instagram: getUrl(props, 'Instagram'),
        // tags
        tags: getMultiSelect(props, 'Tags')
    };
}

function dirForType(type) {
    if (type === 'course') return 'content/courses';
    if (type === 'teacher') return 'content/teachers';
    if (type === 'testimonial') return 'content/testimonials';
    return 'content/sections'; // hero/feature/servicio/contacto/pagina...
}

async function writeMarkdown(dir, slug, data, content) {
    await fs.mkdir(dir, { recursive: true });
    const file = path.join(dir, `${slug}.md`);
    const fm = matter.stringify(content || '', data);
    await fs.writeFile(file, fm, 'utf8');
}

async function getFirstDataSourceId(databaseId) {
    // 1) obtener los data sources del database
    const db = await notion.request({
        method: 'GET',
        path: `databases/${databaseId}`,
    });
    const dataSources = db.data_sources || [];
    if (!dataSources.length) {
        throw new Error(`La base ${databaseId} no tiene data_sources (o no tienes permisos).`);
    }
    return dataSources[0].id; // usamos el primero
}

async function queryPublishedPages(dataSourceId, start_cursor) {
    // Con SDK v5, si está disponible:
    if (notion?.dataSources?.query) {
        return notion.dataSources.query({
            data_source_id: dataSourceId,
            start_cursor,
            // tu filtro de "Publicado"
            filter: {
                property: 'Status',
                select: { equals: 'Published' },
            },
            // (opcional) page_size, sorts...
        });
    }
    // Fallback manual si tu runtime no expone aún .dataSources.query
    return notion.request({
        method: 'POST',
        path: `data_sources/${dataSourceId}/query`,
        body: {
            start_cursor,
            filter: {
                property: 'Status',
                select: { equals: 'Publicado' },
            },
        },
    });
}

async function run() {
    if (!DB_ID || !process.env.NOTION_TOKEN) {
        throw new Error('Faltan NOTION_TOKEN o NOTION_DB_ID');
    }

    // Limpia contenido previo
    await fs.rm('content', { recursive: true, force: true });

    // 1) descubrir el data_source_id a partir del database_id
    const DATA_SOURCE_ID = await getFirstDataSourceId(DB_ID);

    let cursor;
    do {
        // 2) query al data source (reemplaza lo anterior de databases.query)
        const res = await queryPublishedPages(DATA_SOURCE_ID, cursor);

        for (const page of res.results) {
            const props = page.properties;
            const m = mapProps(props);
            if (!m.slug) continue;

            // 3) convertir el contenido a Markdown como ya lo hacías
            const mdBlocks = await n2m.pageToMarkdown(page.id);
            const mdString = n2m.toMarkdownString(mdBlocks).parent || '';

            const fm = {
                title: m.title,
                seoDescription: m.seoDescription,
                type: m.type,
                tags: m.tags,
                price: m.price,
                duration: m.duration,
                schedule: m.schedule,
                level: m.level,
                teacher: m.teacher,
                role: m.role,
                languages: m.languages,
                photo: m.photo,
                rating: m.rating,
                phone: m.phone,
                email: m.email,
                address: m.address,
                facebook: m.facebook,
                instagram: m.instagram,
            };

            await writeMarkdown(dirForType(m.type), m.slug, fm, mdString);
        }

        cursor = res.has_more ? res.next_cursor : undefined;
    } while (cursor);

    console.log('✅ Notion sync done.');
}

run().catch(err => { console.error(err); process.exit(1); });