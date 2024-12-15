import { route, type RouteConfigEntry } from '@react-router/dev/routes';
import path from 'path';
import bPath from 'path-browserify';
// All functions here are related to importing the MDX files safely

export async function getAllArticlesRoute(): Promise<RouteConfigEntry[]> {
  const articles = import.meta.glob('./**/*.md');

  const routes: RouteConfigEntry[] = [];
  for (const [articlePath] of Object.entries(articles)) {
    const routePath = articlePath.replace('./', '');
    const filename = path.parse(articlePath).name;

    const routesPath = `./articles/${routePath}`;
    if (filename === 'index') {
      const dir = path.join('articles', path.parse(routePath).dir);
      routes.push(route(dir, routesPath));
    } else {
      const dir = path.join('articles', routePath);
      routes.push(route(dir, routesPath));
    }
  }

  return routes;
}

type ArticleInformation = {
  name: string;
  path: string;
  order: number;
};

type ArticleModule = {
  frontmatter: {
    title: string;
    order: number;
  };
};

export async function getArticleInformation(): Promise<ArticleInformation[]> {
  const articles = import.meta.glob('./**/*.md');

  const articleInformation: ArticleInformation[] = [];
  for (const [articlePath, func] of Object.entries(articles)) {
    const module = (await func()) as ArticleModule;

    const routePath = articlePath.replace('./', '');
    const filename = bPath.parse(articlePath).name;
    let dir: string;
    if (filename === 'index') {
      dir = bPath.join('articles', bPath.parse(routePath).dir);
    } else {
      dir = bPath.join('articles', routePath);
    }

    articleInformation.push({
      name: module.frontmatter.title,
      path: dir,
      order: module.frontmatter.order,
    });
  }

  return articleInformation.sort((a, b) => a.order - b.order);
}
