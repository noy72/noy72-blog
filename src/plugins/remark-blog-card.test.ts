import { describe, it, expect } from "vitest";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkStringify from "remark-stringify";
import remarkBlogCard from "./remark-blog-card";

function process(markdown: string): string {
  const result = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkBlogCard)
    .use(remarkStringify)
    .processSync(markdown);
  return String(result);
}

describe("remarkBlogCard", () => {
  it("|embed付きリンクをiframeに変換する", () => {
    const output = process("[example](https://example.com|embed)\n");
    expect(output).toContain("<iframe");
    expect(output).toContain(
      'src="https://hatenablog-parts.com/embed?url=https://example.com"',
    );
  });

  it("iframeにhatenablogcardクラスを付与する", () => {
    const output = process("[example](https://example.com|embed)\n");
    expect(output).toContain('class="hatenablogcard"');
  });

  it("iframeにスタイルを付与する", () => {
    const output = process("[example](https://example.com|embed)\n");
    expect(output).toContain(
      'style="width:100%; height:155px; max-width:640px;"',
    );
  });

  it("iframeにframeborder=0とscrolling=noを付与する", () => {
    const output = process("[example](https://example.com|embed)\n");
    expect(output).toContain('frameborder="0"');
    expect(output).toContain('scrolling="no"');
  });

  it("|embedなしのリンクは変換しない", () => {
    const output = process("[example](https://example.com)\n");
    expect(output).not.toContain("<iframe");
    expect(output).toContain("[example](https://example.com)");
  });

  it("通常のテキストは変換しない", () => {
    const output = process("これは普通のテキストです\n");
    expect(output).not.toContain("<iframe");
    expect(output).toContain("これは普通のテキストです");
  });

  it("インライン中の|embedリンクも変換する", () => {
    const output = process(
      "テキスト [example](https://example.com|embed) テキスト\n",
    );
    expect(output).toContain("<iframe");
  });

  it("連続する|embedリンクはそれぞれ変換される", () => {
    const input = [
      "[a](https://example.com/a|embed)",
      "",
      "[b](https://example.com/b|embed)",
      "",
    ].join("\n");
    const output = process(input);
    const iframeCount = (output.match(/<iframe/g) || []).length;
    expect(iframeCount).toBe(2);
  });

  it("URLのクエリパラメータを保持する", () => {
    const output = process(
      "[example](https://example.com/path?key=value|embed)\n",
    );
    expect(output).toContain("url=https://example.com/path?key=value");
  });

  it("|embed以外のサフィックスは変換しない", () => {
    const output = process("[example](https://example.com|other)\n");
    expect(output).not.toContain("<iframe");
  });
});
