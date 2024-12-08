import { type RouteConfig, index, layout, route } from '@react-router/dev/routes';

export default [
  layout('./layouts/default.tsx', [
    index('routes/home.tsx'),
    route('users', './routes/users.tsx'),
    route('posts', './routes/posts.tsx'),
  ]),
  route('login', './routes/login.tsx'),
] satisfies RouteConfig;
