import sanitizeHtml from "sanitize-html";

// Allowlist phù hợp với output của Tiptap editor (rich-text bài viết CMS)
const CMS_ALLOWED_TAGS = [
  ...sanitizeHtml.defaults.allowedTags,
  "img", "figure", "figcaption", "picture", "source",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td",
  "details", "summary", "mark", "kbd", "sub", "sup",
];

const CMS_ALLOWED_ATTRIBUTES: sanitizeHtml.IOptions["allowedAttributes"] = {
  ...sanitizeHtml.defaults.allowedAttributes,
  "*": ["class", "id"],
  "a": ["href", "name", "target", "rel", "class"],
  "img": ["src", "alt", "title", "width", "height", "class", "loading"],
  "td": ["colspan", "rowspan", "class"],
  "th": ["colspan", "rowspan", "class", "scope"],
  "source": ["src", "srcset", "type", "media"],
};

export function sanitizeCmsHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: CMS_ALLOWED_TAGS,
    allowedAttributes: CMS_ALLOWED_ATTRIBUTES,
    // Cho phép data: URLs cho ảnh inline nhưng chặn javascript:
    allowedSchemes: ["http", "https", "mailto", "data"],
    allowedSchemesByTag: {
      img: ["http", "https", "data"],
    },
  });
}
