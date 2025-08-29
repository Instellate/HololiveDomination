import { Outlet } from 'react-router';

export default function Articles() {
  return (
    <div className="prose m-4 dark:prose-invert">
      <Outlet />
    </div>
  );
}
