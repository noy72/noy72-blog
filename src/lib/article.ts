import type { CollectionEntry } from "astro:content";

export type ArticleWithPublishDate = CollectionEntry<"articles"> & {
  publishDate: Date;
};

/**
 * 記事コレクションに公開日を追加する
 *
 * ファイル名から日付を抽出し、記事に埋め込む
 * 不正な形式の記事は除外される
 *
 * @param articles - Astro Content Collectionsの記事配列
 * @returns 公開日を含む記事配列
 */
export function addPublishDateToArticles(
  articles: CollectionEntry<"articles">[],
): ArticleWithPublishDate[] {
  return articles
    .map((article) => {
      const publishDate = extractDateFromId(article.id);
      if (!publishDate) return null;
      return { ...article, publishDate };
    })
    .filter((article): article is ArticleWithPublishDate => article !== null);
}

/**
 * 記事IDから公開日を抽出する
 *
 * @param id - Astro Content Collectionsの記事ID（ファイル名から拡張子を除いたもの）
 *              例: "2025-12-07_first-post" (ファイル名: 2025-12-07_first-post.md)
 * @returns 抽出した日付、または形式が不正な場合は null
 */
function extractDateFromId(id: string): Date | null {
  const match = id.match(/^(\d{4})-(\d{2})-(\d{2})_/);
  if (!match) {
    console.warn(`記事ファイル名の形式が不正です: "${id}"\n`);
    return null;
  }

  const year = parseInt(match[1]);
  const month = parseInt(match[2]);
  const day = parseInt(match[3]);
  const date = new Date(year, month - 1, day);

  // Dateが期待した値と一致するかチェック（不正な日付を弾く）
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    console.warn(`不正な日付です: ${year}-${month}-${day} in "${id}"\n`);
    return null;
  }

  return date;
}
