import { postsColumns } from '~/components/user-table/columns';
import { DataTable } from '~/components/user-table/data-table';
import Http from '~/lib/http';
import type { Route } from './+types/posts';
import { useMemo, useState } from 'react';
import debounce from 'lodash.debounce';

export async function clientLoader() {
  const searchParams = new URLSearchParams(window.location.search);
  const pageStr = searchParams.get('page');
  const pageOrNaN = Number(pageStr);
  const page = Number.isNaN(pageOrNaN) ? 0 : pageOrNaN;

  const http = new Http();
  return await http.getPosts(undefined, page);
}

const intRegex = /^[0-9]+$/i;

export default function Posts({ loaderData }: Route.ComponentProps) {
  const [posts, setPosts] = useState(loaderData);
  const [page, setPage] = useState(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const pageStr = searchParams.get('page');
    const pageOrNaN = Number(pageStr);
    return Number.isNaN(pageOrNaN) ? 0 : pageOrNaN;
  });
  const [tags, setTags] = useState('');

  const debouncedSearch = useMemo(
    () =>
      debounce<(s: string) => Promise<void>>(async (s) => {
        const http = new Http();
        const test = intRegex.test(s);
        if (test) {
          setPosts({
            pageCount: 1,
            posts: [await http.getPost(Number(s))],
          });
          setPage(0);
        } else {
          if (s.trim()) {
            setPosts(await http.getPosts(s));
            setPage(0);
          }
        }
      }, 250),
    [setPosts],
  );

  return (
    <div className="pt-4">
      <DataTable
        columns={postsColumns}
        data={posts.posts}
        pageCount={posts.pageCount}
        pageSize={10}
        onSearchChange={(s) => {
          debouncedSearch(s);
          setTags(s);
        }}
        onPageChange={async (p) => {
          if (page < p) {
            const newUsers = (await new Http().getPosts(tags, p)).posts;
            setPosts((o) => {
              o.posts.push(...newUsers);
              return o;
            });
            setPage(p);
          }
        }}
      />
    </div>
  );
}
