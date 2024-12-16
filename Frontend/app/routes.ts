import { type RouteConfig, index, layout, prefix, route } from '@react-router/dev/routes';
import { getAllArticlesRoute } from './articles/import';

export default [
  layout('./layouts/default.tsx', [
    index('routes/home.tsx'),
    route('users', './routes/users.tsx'),
    ...prefix('posts', [index('./routes/posts/index.tsx'), route(':id', './routes/posts/id.tsx')]),
    layout('./layouts/articles.tsx', await getAllArticlesRoute()),
  ]),
  route('login', './routes/login.tsx'),
] satisfies RouteConfig;
