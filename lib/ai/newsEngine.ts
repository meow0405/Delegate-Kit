import Parser from "rss-parser";
import { newsDigestSchema, type NewsDigest } from "./schemas";
import { generateJson } from "./provider";

const parser = new Parser();

export async function buildNewsDigest(query: string, researchContext?: string) {
  const fallback: NewsDigest = {
    query,
    items: [
      {
        title: `Offline research brief for ${query}`,
        source: "Local Delegate Kit",
        summary: "Connect to local RSS/network sources or paste research notes to enrich this digest.",
        relevance: 0.5,
      },
    ],
  };

  try {
    const feed = await parser.parseURL("https://news.un.org/feed/subscribe/en/news/all/rss.xml");
    const items = feed.items.slice(0, 6).map((item) => ({
      title: item.title ?? "UN News item",
      source: "UN News",
      url: item.link,
      publishedAt: item.isoDate,
      summary: item.contentSnippet ?? item.content ?? "",
      relevance: item.title?.toLowerCase().includes(query.toLowerCase()) ? 0.9 : 0.45,
    }));

    return newsDigestSchema.parse({ query, items });
  } catch {
    return generateJson(
      `Create a compact news research digest for this Model UN query: ${query}.
Imported delegate research:
${researchContext || "No uploaded research sources."}
Return JSON with query and items. Attribute imported claims to their source filenames.`,
      newsDigestSchema,
      fallback,
    );
  }
}
