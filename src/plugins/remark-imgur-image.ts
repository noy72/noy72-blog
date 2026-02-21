import type { Root, Paragraph, Html, Link } from "mdast";
import type { Plugin } from "unified";

const IMGUR_PATTERN =
  /^https:\/\/i\.imgur\.com\/([a-zA-Z0-9]+)(?:\|([0-9.]+))?$/;

function getImgurMatch(
  node: Paragraph,
): { id: string; scale: number; caption: string | null } | null {
  const children = node.children;
  if (children.length === 0 || children[0].type !== "link") return null;

  const urlText = decodeURIComponent((children[0] as Link).url);
  const m = urlText.match(IMGUR_PATTERN);
  if (!m) return null;

  let caption: string | null = null;
  if (children.length === 2 && children[1].type === "text") {
    const text = children[1].value;
    if (text.startsWith("\n")) {
      caption = text.slice(1).trim();
    }
  }

  return { id: m[1], scale: m[2] ? parseFloat(m[2]) : 1.0, caption };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const remarkImgurImage: Plugin<[], Root> = () => {
  return (tree: Root) => {
    for (let i = 0; i < tree.children.length; i++) {
      const node = tree.children[i];
      if (node.type !== "paragraph") continue;

      const match = getImgurMatch(node);
      if (!match) continue;

      const { id, scale, caption } = match;

      const alt = caption !== null ? escapeHtml(caption) : "";
      const zoomStyle = scale !== 1.0 ? ` style="zoom: ${scale}"` : "";
      const figcaption =
        caption !== null ? `\n  <figcaption>${alt}</figcaption>` : "";
      const sizes = `(max-width: 320px) 320px, (max-width: 640px) 640px, 640px`;

      tree.children[i] = {
        type: "html",
        value: [
          `<figure class="imgur-figure"${zoomStyle}>`,
          `  <picture>`,
          `    <source`,
          `      type="image/webp"`,
          `      sizes="${sizes}"`,
          `      srcset="`,
          `        https://i.imgur.com/${id}h.webp 1024w,`,
          `        https://i.imgur.com/${id}l.webp 640w,`,
          `        https://i.imgur.com/${id}m.webp 320w`,
          `      "`,
          `    />`,
          `    <img src="https://i.imgur.com/${id}l.webp" alt="${alt}" loading="lazy" />`,
          `  </picture>${figcaption}`,
          `</figure>`,
        ].join("\n"),
      } satisfies Html;
    }
  };
};

export default remarkImgurImage;
