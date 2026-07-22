import sanitizeHtml from "sanitize-html";

const richTextOptions: sanitizeHtml.IOptions = {
  allowedTags: ["p", "h2", "h3", "strong", "em", "u", "ul", "ol", "li", "blockquote", "a", "br"],
  allowedAttributes: {
    a: ["href", "target", "rel"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowProtocolRelative: false,
  transformTags: {
    a: (_tagName, attributes) => ({
      tagName: "a",
      attribs: {
        href: attributes.href ?? "",
        target: "_blank",
        rel: "noopener noreferrer",
      },
    }),
  },
};

export function sanitizeRichText(html: string) {
  return sanitizeHtml(html, richTextOptions).trim();
}

export function richTextToPlainText(html: string) {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, " ").trim();
}
