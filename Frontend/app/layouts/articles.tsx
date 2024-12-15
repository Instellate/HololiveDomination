import { Outlet } from 'react-router';

export default function Articles() {
  return (
    <div className="prose dark:prose-invert m-4">
      <Outlet />
    </div>
  );
}
