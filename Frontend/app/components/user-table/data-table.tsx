import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useEffect, useMemo, useState } from 'react';
import debounce from 'lodash.debounce';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onSearchChange?: (query: string) => void;
  onPageChange?: (index: number) => void;
  pageCount: number;
  pageSize?: number;
  page?: number;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onSearchChange,
  onPageChange,
  pageCount,
  pageSize = 20,
  page,
}: DataTableProps<TData, TValue>) {
  const [pageValue, setPageValue] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: page ?? 0,
    pageSize,
  });

  useEffect(() => {
    onPageChange?.call(undefined, pagination.pageIndex);
    setPageValue(String(pagination.pageIndex));
  }, [onPageChange, pagination.pageIndex]);

  const numberInputDebounce = useMemo(
    () =>
      debounce((e: React.ChangeEvent<HTMLInputElement>) => {
        setPagination((o) => ({ ...o, pageIndex: Number(e.target.value) }));
      }, 200),
    [setPagination],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    pageCount,
    manualPagination: true,
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
  });

  return (
    <div>
      <div className="flex-items-center py-4">
        <Input
          placeholder="Search..."
          className="max-w-sm"
          onChange={(e) => {
            onSearchChange?.call(undefined, e.target.value);
            table.resetPageIndex(true);
          }}
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Input
          className="h-9 w-16 border-input"
          defaultValue={pagination.pageIndex}
          value={pageValue}
          onKeyDown={(e) => {
            if (e.key === 'Backspace') {
              return;
            }
            if (!e.cancelable) {
              return;
            }

            const numberStr = pageValue + e.key;
            if (!Number.isNaN(Number(numberStr))) {
              const page = Number(numberStr);
              if (page < 0) {
                e.preventDefault();
              } else if (page > pageCount) {
                e.preventDefault();
              }
            } else {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
          onChange={(e) => {
            setPageValue(e.target.value);
            numberInputDebounce(e);
          }}
          min={1}
          max={pageCount}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
