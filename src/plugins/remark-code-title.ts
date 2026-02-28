import type { Root, Code, Html } from "mdast";
import type { Plugin } from "unified";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const remarkCodeTitle: Plugin<[], Root> = () => {
  return (tree: Root) => {
    // 後ろから処理することで、挿入による index のズレを防ぐ
    for (let i = tree.children.length - 1; i >= 0; i--) {
      const node = tree.children[i];
      if (node.type !== "code") continue;

      const codeNode = node as Code;
      if (!codeNode.lang) continue;

      const titleIndex = codeNode.lang.indexOf(":title=");
      if (titleIndex === -1) continue;

      const title = codeNode.lang.slice(titleIndex + ":title=".length);
      const lang = codeNode.lang.slice(0, titleIndex);
      codeNode.lang = lang.length > 0 ? lang : null;

      const titleNode: Html = {
        type: "html",
        value: `<div class="code-title">${escapeHtml(title)}</div>`,
      };

      tree.children.splice(i, 0, titleNode);
    }
  };
};

export default remarkCodeTitle;
