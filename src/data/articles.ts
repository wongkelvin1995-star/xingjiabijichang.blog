import { Article } from '@/types';
import { NEW_ARTICLES } from './articlesNew';
import { LEGACY_ARTICLES } from './articlesLegacy';

/**
 * 全站文章：先放新增的六篇主题文章，再放第一批文章。
 * 首页“最新文章”取前六篇，博客目录按此顺序展示。
 */
export const ARTICLES: Article[] = [...NEW_ARTICLES, ...LEGACY_ARTICLES];

export function getAllArticles(): Article[] {
  return ARTICLES;
}

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}
