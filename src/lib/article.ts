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
 *              例: "2025-12-07-first-post" (ファイル名: 2025-12-07-first-post.md)
 *                  "2025-12-07" (ファイル名: 2025-12-07.md)
 * @returns 抽出した日付、または形式が不正な場合は null
 */
function extractDateFromId(id: string): Date | null {
  const match = id.match(/^(\d{4})-(\d{2})-(\d{2})(?:-|$)/);
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

export function extractFirstParagraphFromMarkdown(content: string): string {
  const paragraphs = content.trim().split(/\n\n+/);
  const firstParagraph = paragraphs.find((p) => p.trim().length > 0) ?? "";
  return firstParagraph.trim().replace(/\n/g, " ");
}

export function extractDescriptionFromMarkdown(content: string): string {
  const maxLength = 150;
  const trimmed = content.trim();
  return trimmed.length <= maxLength
    ? trimmed
    : trimmed.slice(0, maxLength) + "...";
}

export type RelatedArticle = {
  id: string;
  title: string;
  publishDate: Date;
};

/**
 * タグの共通数が多い順に関連記事を返す
 *
 * 共通タグ数が同じ場合は公開日が新しい順にソートする
 * 現在の記事にタグがない場合は空配列を返す
 *
 * @param currentArticle - 関連記事を探す対象の記事
 * @param allArticles - 検索対象の全記事
 * @param maxCount - 返す記事の最大数（デフォルト: 3）
 * @returns 関連記事の配列
 */
export function findRelatedArticles(
  currentArticle: ArticleWithPublishDate,
  allArticles: ArticleWithPublishDate[],
  maxCount: number = 3,
): RelatedArticle[] {
  const currentTags = currentArticle.data.tags ?? [];
  if (currentTags.length === 0) return [];

  const currentTagSet = new Set(currentTags);

  return allArticles
    .filter((article) => article.id !== currentArticle.id)
    .map((article) => {
      const tags = article.data.tags ?? [];
      const commonTagCount = tags.filter((tag) =>
        currentTagSet.has(tag),
      ).length;
      return { article, commonTagCount };
    })
    .filter(({ commonTagCount }) => commonTagCount > 0)
    .toSorted((a, b) => {
      if (b.commonTagCount !== a.commonTagCount) {
        return b.commonTagCount - a.commonTagCount;
      }
      return b.article.publishDate.getTime() - a.article.publishDate.getTime();
    })
    .slice(0, maxCount)
    .map(({ article }) => ({
      id: article.id,
      title: article.data.title,
      publishDate: article.publishDate,
    }));
}
