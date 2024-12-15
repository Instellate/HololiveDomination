import { type RouteConfig, index, layout, route } from '@react-router/dev/routes';
import { getAllArticlesRoute } from './articles/import';

export default [
  layout('./layouts/default.tsx', [
    index('routes/home.tsx'),
    route('users', './routes/users.tsx'),
    route('posts', './routes/posts.tsx'),
    layout('./layouts/articles.tsx', await getAllArticlesRoute()),
  ]),
  route('login', './routes/login.tsx'),
] satisfies RouteConfig;
