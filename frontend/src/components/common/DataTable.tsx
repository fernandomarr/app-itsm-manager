'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  onRowClick,
  emptyMessage = 'No data available',
  className,
}: DataTableProps<T>) {
  const getValue = (item: T, column: Column<T>) => {
    if (column.render) {
      return column.render(item);
    }

    const key = column.key as string;
    const keys = key.split('.');
    let value: any = item;

    for (const k of keys) {
      value = value?.[k];
    }

    return value;
  };

  if (data.length === 0) {
    return (
      <div className={cn('text-center py-12 text-muted-foreground', className)}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b">
            {columns.map((column) => (
              <th
                key={column.header}
                className={cn(
                  'px-4 py-3 text-left text-sm font-medium text-muted-foreground',
                  column.className
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={item.id}
              onClick={() => onRowClick?.(item)}
              className={cn(
                'border-b transition-colors',
                onRowClick && 'cursor-pointer hover:bg-accent/50'
              )}
            >
              {columns.map((column) => (
                <td
                  key={column.header}
                  className={cn('px-4 py-3 text-sm', column.className)}
                >
                  {getValue(item, column)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
