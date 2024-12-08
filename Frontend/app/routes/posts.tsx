import { postsColumns } from '~/components/user-table/columns';
import { DataTable } from '~/components/user-table/data-table';
import Http from '~/lib/http';
import type { Route } from './+types/posts';
import { useMemo, useState } from 'react';
import debounce from 'lodash.debounce';

export async function clientLoader() {
  const http = new Http();
  return await http.getPosts(undefined);
}

const intRegex = /^[0-9]+$/i;

export default function Posts({ loaderData }: Route.ComponentProps) {
  const [posts, setPosts] = useState(loaderData);
  const [page, setPage] = useState(1);
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
        } else {
          setPosts(await http.getPosts(s));
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
        onSearchChange={(s) => {
          debouncedSearch(s);
          setTags(s);
        }}
        onPageChange={async (p) => {
          if (page !== p) {
            setPosts(await new Http().getPosts(tags, p));
            setPage(p);
          }
        }}
      />
    </div>
  );
}
