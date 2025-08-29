import debounce from 'lodash.debounce';
import type { Route } from './+types/logs';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback, useMemo, useState } from 'react';
import { DataTable } from '~/components/user-table/data-table';
import Http, { type Log } from '~/lib/http';
import { DateFormatter } from '@internationalized/date';

export async function clientLoader() {
  const http = new Http();
  return await http.getLogs();
}

const byRegex = /by:([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/;
const towardsRegex = /towards:([a-zA-Z0-9-]+)/;

const logsColumn: ColumnDef<Log>[] = [
  {
    accessorKey: 'by',
    header: 'By',
  },
  {
    accessorKey: 'towards',
    header: 'Towards',
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    accessorKey: 'createdAt',
    header: 'Done at',
    cell: ({ row }) => {
      const createdAt: number = row.getValue('createdAt');
      const df = new DateFormatter(navigator.language, {
        dateStyle: 'long',
        timeStyle: 'short',
      });
      return <div className="font-medium">{df.format(new Date(createdAt))}</div>;
    },
  },
];

export default function Logs({ loaderData }: Route.ComponentProps) {
  const [logs, setLogs] = useState(loaderData.logs);
  const [pageCount, setPageCount] = useState(loaderData.pageCount);
  const [by, setBy] = useState<string | undefined>();
  const [towards, setTowards] = useState<string | undefined>();

  const search = useMemo(
    () =>
      debounce(async (query: string) => {
        const byResult = byRegex.exec(query);
        setBy(byResult?.[1] ?? undefined);

        const towardsResult = towardsRegex.exec(query);
        setTowards(towardsResult?.[1] ?? undefined);

        const http = new Http();
        const newLogs = await http.getLogs(0, by, towards);
        setLogs(newLogs.logs);
        setPageCount(newLogs.pageCount);
      }, 250),
    [setLogs, setTowards, setBy, setPageCount],
  );

  const pageChanged = useCallback(
    async (page: number) => {
      const http = new Http();
      const newLogs = await http.getLogs(page, by, towards);
      setLogs(newLogs.logs);
      setPageCount(newLogs.pageCount);
    },
    [by, towards, setLogs, setPageCount],
  );

  return (
    <div>
      <DataTable
        columns={logsColumn}
        data={logs}
        pageSize={20}
        pageCount={pageCount}
        onSearchChange={search}
        onPageChange={pageChanged}
      />
    </div>
  );
}
