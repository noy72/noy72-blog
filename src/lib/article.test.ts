import { describe, expect, it } from "vitest";
import {
  addPublishDateToArticles,
  extractFirstParagraphFromMarkdown,
} from "./article.ts";
import type { CollectionEntry } from "astro:content";

function makeArticle(id: string): CollectionEntry<"articles"> {
  return {
    id,
    data: { title: "test", draft: false },
    collection: "articles",
  };
}

describe("addPublishDateToArticles", () => {
  it("YYYY-MM-DD-slug 形式のファイル名から日付を抽出する", () => {
    const articles = [makeArticle("2025-01-15-my-post")];
    const result = addPublishDateToArticles(articles);
    expect(result).toHaveLength(1);
    expect(result[0].publishDate).toEqual(new Date(2025, 0, 15));
  });

  it("YYYY-MM-DD 形式（日付のみ）のファイル名から日付を抽出する", () => {
    const articles = [makeArticle("2021-09-10")];
    const result = addPublishDateToArticles(articles);
    expect(result).toHaveLength(1);
    expect(result[0].publishDate).toEqual(new Date(2021, 8, 10));
  });

  it("不正な形式のファイル名は除外される", () => {
    const articles = [makeArticle("invalid-filename")];
    const result = addPublishDateToArticles(articles);
    expect(result).toHaveLength(0);
  });

  it("不正な日付は除外される", () => {
    const articles = [makeArticle("2025-13-01-post")];
    const result = addPublishDateToArticles(articles);
    expect(result).toHaveLength(0);
  });

  it("複数の記事を処理できる", () => {
    const articles = [
      makeArticle("2025-01-15-post-a"),
      makeArticle("2021-09-10"),
      makeArticle("invalid"),
    ];
    const result = addPublishDateToArticles(articles);
    expect(result).toHaveLength(2);
  });
});

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
