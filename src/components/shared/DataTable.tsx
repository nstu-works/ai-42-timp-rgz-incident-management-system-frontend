'use client'

import { useState } from 'react'
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[]
  data: TData[]
  isLoading?: boolean
  emptyMessage?: string
  initialSorting?: SortingState
}

export function DataTable<TData>({
  columns,
  data,
  isLoading,
  emptyMessage = 'Нет данных',
  initialSorting = [],
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting)

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    enableSortingRemoval: false,
    state: { sorting },
  })

  return (
    <div className="rounded-lg border border-[#27272a] bg-[#18181b]">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id} className="border-[#27272a] hover:bg-transparent">
              {hg.headers.map((h) => {
                const canSort = h.column.getCanSort()
                const sorted = h.column.getIsSorted()
                return (
                  <TableHead
                    key={h.id}
                    className="text-[#71717a]"
                  >
                    {h.isPlaceholder ? null : canSort ? (
                      <button
                        type="button"
                        onClick={h.column.getToggleSortingHandler()}
                        className="flex items-center gap-1 hover:text-[#a1a1aa] transition-colors"
                      >
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {sorted === 'asc' ? (
                          <ChevronUp className="size-3.5 text-[#a78bfa]" />
                        ) : sorted === 'desc' ? (
                          <ChevronDown className="size-3.5 text-[#a78bfa]" />
                        ) : (
                          <ArrowUpDown className="size-3.5 opacity-40" />
                        )}
                      </button>
                    ) : (
                      flexRender(h.column.columnDef.header, h.getContext())
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="py-10 text-center text-[#71717a]"
              >
                Загрузка...
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="py-10 text-center text-[#71717a]"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="border-[#27272a] hover:bg-[#27272a]/40"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="text-[#fafafa]">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
