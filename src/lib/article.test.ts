import { describe, expect, it } from "vitest";
import { extractFirstParagraphFromMarkdown } from "./article.ts";

describe("extractFirstParagraphFromMarkdown", () => {
  it("単純な段落を返す", () => {
    const content = "これは最初の段落です。";
    expect(extractFirstParagraphFromMarkdown(content)).toBe(
      "これは最初の段落です。",
    );
  });

  it("複数の段落がある場合は最初の段落だけを返す", () => {
    const content = "最初の段落。\n\n二番目の段落。";
    expect(extractFirstParagraphFromMarkdown(content)).toBe("最初の段落。");
  });

  it("段落内の改行をスペースに変換する", () => {
    const content = "一行目\n二行目\n三行目\n\n二番目の段落。";
    expect(extractFirstParagraphFromMarkdown(content)).toBe(
      "一行目 二行目 三行目",
    );
  });

  it("先頭の空白行をスキップする", () => {
    const content = "\n\n最初の段落。\n\n二番目の段落。";
    expect(extractFirstParagraphFromMarkdown(content)).toBe("最初の段落。");
  });

  it("英語の文章でも動作する", () => {
    const content = "This is the first paragraph.\n\nThis is the second.";
    expect(extractFirstParagraphFromMarkdown(content)).toBe(
      "This is the first paragraph.",
    );
  });
});
