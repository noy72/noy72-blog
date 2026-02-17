import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { addPublishDateToArticles } from "../lib/article";
import { SITE_CONFIG } from "../config/site";
export async function GET() {
  const articles = await getCollection("articles");
  const articlesWithDate = addPublishDateToArticles(articles);

  const publishedArticles = articlesWithDate
    .filter((article) => !article.data.draft)
    .sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime());

  return rss({
    title: SITE_CONFIG.siteName,
    description: SITE_CONFIG.description,
    site: SITE_CONFIG.baseUrl,
    items: publishedArticles.map((article) => ({
      title: article.data.title,
      description: article.data.description || "",
      link: `/articles/${article.id}`,
      pubDate: article.publishDate,
    })),
  });
}
