import { describe, it, expect } from "vitest";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import remarkCodeTitle from "./remark-code-title";

function process(markdown: string): string {
  const result = unified()
    .use(remarkParse)
    .use(remarkCodeTitle)
    .use(remarkStringify)
    .processSync(markdown);
  return String(result);
}

describe("remarkCodeTitle", () => {
  it(":title= を持つコードブロックの前にタイトル div を挿入する", () => {
    const output = process("```js:title=main.js\nconsole.log('hi')\n```\n");
    expect(output).toContain('<div class="code-title">main.js</div>');
  });

  it("lang から :title= を除去する", () => {
    const output = process("```js:title=main.js\nconsole.log('hi')\n```\n");
    expect(output).not.toContain("js:title=main.js");
    expect(output).toContain("```js");
  });

  it("lang なしで :title= のみの場合、タイトルを挿入して lang を除去する", () => {
    const output = process("```:title=main.js\nconsole.log('hi')\n```\n");
    expect(output).toContain('<div class="code-title">main.js</div>');
  });

  it("タイトル内の特殊文字をエスケープする", () => {
    const output = process(
      '```js:title=<script>alert("xss")</script>\ncode\n```\n',
    );
    expect(output).toContain("&lt;script&gt;");
    expect(output).not.toContain("<script>");
  });

  it(":title= のないコードブロックは変換しない", () => {
    const output = process("```js\nconsole.log('hi')\n```\n");
    expect(output).not.toContain("code-title");
  });

  it("lang なしのコードブロックは変換しない", () => {
    const output = process("```\nplain text\n```\n");
    expect(output).not.toContain("code-title");
  });

  it("複数のコードブロックをそれぞれ独立して処理する", () => {
    const input = [
      "```js:title=a.js",
      "const a = 1",
      "```",
      "",
      "```ts:title=b.ts",
      "const b: number = 2",
      "```",
      "",
    ].join("\n");
    const output = process(input);
    expect(output).toContain('<div class="code-title">a.js</div>');
    expect(output).toContain('<div class="code-title">b.ts</div>');
  });
});
