import { describe, it, expect } from "vitest";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkStringify from "remark-stringify";
import remarkImgurImage from "./remark-imgur-image";

function process(markdown: string): string {
  const result = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkImgurImage)
    .use(remarkStringify)
    .processSync(markdown);
  return String(result);
}

describe("remarkImgurImage", () => {
  it("imgur URLをfigure要素に変換する", () => {
    const output = process("https://i.imgur.com/abc123\n");
    expect(output).toContain('<figure class="imgur-figure">');
    expect(output).toContain("<picture>");
    expect(output).toContain(
      '<img src="https://i.imgur.com/abc123l.webp" alt="" loading="lazy" />',
    );
    expect(output).not.toContain("<figcaption>");
  });

  it("source要素にsrcsetを含む", () => {
    const output = process("https://i.imgur.com/abc123\n");
    expect(output).toContain("<source");
    expect(output).toContain('type="image/webp"');
    expect(output).toContain("https://i.imgur.com/abc123h.webp 1024w");
    expect(output).toContain("https://i.imgur.com/abc123l.webp 640w");
    expect(output).toContain("https://i.imgur.com/abc123m.webp 320w");
  });

  it("source要素にsizesを含む", () => {
    const output = process("https://i.imgur.com/abc123\n");
    expect(output).toContain(
      'sizes="(max-width: 320px) 320px, (max-width: 640px) 640px, 640px"',
    );
  });

  it("同一段落内のソフトブレイク後のテキストをキャプションとして使用する", () => {
    const output = process("https://i.imgur.com/abc123\nキャプション\n");
    expect(output).toContain("<figcaption>キャプション</figcaption>");
    expect(output).toContain('alt="キャプション"');
  });

  it("空行で区切られた次の段落はキャプションにならない", () => {
    const output = process("https://i.imgur.com/abc123\n\n次の段落\n");
    expect(output).not.toContain("<figcaption>");
    expect(output).toContain("次の段落");
  });

  it("scaleパラメータでzoomスタイルを付与する", () => {
    const output = process("https://i.imgur.com/abc123|0.5\n");
    expect(output).toContain('style="zoom: 0.5"');
  });

  it("scaleなしの場合はzoomスタイルを付与しない", () => {
    const output = process("https://i.imgur.com/abc123\n");
    expect(output).not.toContain("style=");
  });

  it("imgur以外のURLは変換しない", () => {
    const output = process("https://example.com/image.png\n");
    expect(output).not.toContain("<figure");
  });

  it("通常のテキスト段落は変換しない", () => {
    const output = process("これは普通のテキストです\n");
    expect(output).not.toContain("<figure");
    expect(output).toContain("これは普通のテキストです");
  });

  it("キャプション内の特殊文字をエスケープする", () => {
    const output = process('https://i.imgur.com/abc123\nA & B "quoted"\n');
    expect(output).toContain("A &amp; B &quot;quoted&quot;");
  });

  it("連続するimgur URLはそれぞれ独立したfigureに変換される", () => {
    const input = [
      "https://i.imgur.com/aaa111",
      "",
      "https://i.imgur.com/bbb222",
      "",
    ].join("\n");
    const output = process(input);
    const figureCount = (output.match(/<figure/g) || []).length;
    expect(figureCount).toBe(2);
  });

  it("scaleパラメータ付きURLとキャプションを正しく処理する", () => {
    const output = process("https://i.imgur.com/icp3jFw|0.7\nキャプション\n");
    expect(output).toContain('<figure class="imgur-figure"');
    expect(output).toContain('style="zoom: 0.7"');
    expect(output).toContain("<figcaption>キャプション</figcaption>");
  });
});
