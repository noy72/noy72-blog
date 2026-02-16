import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { addPublishDateToArticles } from "../lib/article";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const articles = await getCollection("articles");
  const articlesWithDate = addPublishDateToArticles(articles);

  const publishedArticles = articlesWithDate
    .filter((article) => !article.data.draft)
    .sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime());

  return rss({
    title: "noy72.com",
    description: "TODO",
    site: context.site?.toString() || "https://noy72.com",
    items: publishedArticles.map((article) => ({
      title: article.data.title,
      description: article.data.description || "",
      link: `/articles/${article.id}`,
      pubDate: article.publishDate,
    })),
  });
}
