import { userColumns } from '~/components/user-table/columns';
import type { Route } from './+types/users';
import { DataTable } from '~/components/user-table/data-table';
import { useMemo, useState } from 'react';
import debounce from 'lodash.debounce';
import Http from '~/lib/http';

export async function clientLoader() {
  const searchParams = new URLSearchParams(window.location.search);
  const pageStr = searchParams.get('page');
  const pageOrNaN = Number(pageStr);
  const page = Number.isNaN(pageOrNaN) ? 0 : pageOrNaN;

  const http = new Http();
  return await http.getUsers(undefined, page);
}

const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function Users({ loaderData }: Route.ComponentProps) {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState(loaderData);
  const [page, setPage] = useState(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const pageStr = searchParams.get('page');
    const pageOrNaN = Number(pageStr);
    return Number.isNaN(pageOrNaN) ? 0 : pageOrNaN;
  });

  const debouncedSearch = useMemo(
    () =>
      debounce<(s: string) => Promise<void>>(async (s) => {
        const http = new Http();
        const test = guidRegex.test(s);
        if (test) {
          setUsers({
            pageCount: 1,
            users: [await http.getUser(s)],
          });
        } else {
          setUsers(await http.getUsers(s));
        }
      }, 250),
    [setUsers],
  );

  return (
    <div className="pt-4">
      <DataTable
        columns={userColumns}
        data={users.users}
        onSearchChange={(s) => {
          debouncedSearch(s);
          setSearch(s);
        }}
        onPageChange={async (p) => {
          if (page !== p) {
            setUsers(await new Http().getUsers(search, p));
            setPage(p);
          }
        }}
        pageCount={users.pageCount}
        pageSize={10}
      />
    </div>
  );
}
