import { DateTime } from "luxon";

export default function (eleventyConfig) {
    // Passthrough
    eleventyConfig.addPassthroughCopy({ "src/css": "css" });
    eleventyConfig.addPassthroughCopy({ "src/js": "js" });
    eleventyConfig.addPassthroughCopy({ "src/img": "img" });

    // Colecciones basadas en Markdown generado
    eleventyConfig.addCollection("courses", (api) =>
        api.getFilteredByGlob("content/courses/*.md")
    );
    eleventyConfig.addCollection("teachers", (api) =>
        api.getFilteredByGlob("content/teachers/*.md")
    );
    eleventyConfig.addCollection("testimonials", (api) =>
        api.getFilteredByGlob("content/testimonials/*.md")
    );

    // Filtros
    eleventyConfig.addFilter("readableDate", (dateObj) =>
        DateTime.fromJSDate(dateObj).toFormat("dd LLL yyyy")
    );
    eleventyConfig.addFilter("bySlug", (items, slug) => {
        return (items || []).find(i => i.fileSlug === slug);
    });
    // Año actual para Nunjucks
    eleventyConfig.addFilter("year", () => new Date().getFullYear());

    return {
        dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
        markdownTemplateEngine: "njk",
        htmlTemplateEngine: "njk"
    };
}