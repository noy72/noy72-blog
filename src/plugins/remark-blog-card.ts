import type { Root, Link, Html, Parent } from "mdast";
import type { Plugin } from "unified";

const EMBED_SUFFIX = "|embed";

function buildIframe(url: string): Html {
  return {
    type: "html",
    value: `<iframe class="hatenablogcard" style="width:100%; height:155px; max-width:640px;" src="https://hatenablog-parts.com/embed?url=${url}" width="300" height="150" frameborder="0" scrolling="no"></iframe>`,
  };
}

function transformLinks(parent: Parent): void {
  for (let i = 0; i < parent.children.length; i++) {
    const node = parent.children[i];

    if (node.type === "link") {
      const link = node as Link;
      if (!link.url.endsWith(EMBED_SUFFIX)) continue;

      const url = link.url.slice(0, -EMBED_SUFFIX.length);
      parent.children[i] = buildIframe(url) as (typeof parent.children)[number];
      continue;
    }

    if ("children" in node) {
      transformLinks(node as Parent);
    }
  }
}

const remarkBlogCard: Plugin<[], Root> = () => {
  return (tree: Root) => {
    transformLinks(tree);
  };
};

export default remarkBlogCard;
