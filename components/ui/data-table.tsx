"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  Row,
  Column,
  Table as TableType,
  RowSelectionState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "./data-table-pagination";
import {
  CalendarIcon,
  CheckCircle2,
  Loader2,
  Share2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface DataTableState<TData> {
  rowSelection: Record<string, boolean>;
  columnVisibility: VisibilityState;
  columnFilters: ColumnFiltersState;
  sorting: SortingState;
  pendingEdits: Map<string, Map<string, EditOperation>>;
}

interface EditOperation {
  value: unknown;
  originalValue: unknown;
  timestamp: number;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  toolbar?: boolean;
  pagination?: boolean;
  filterColumn?: string;
  isLoading?: boolean;
  searchKey?: string;
  onPaginationChange?: any;
  totalRows?: number;
  pageIndex?: number;
  pageSize?: number;
  onDelete?: (rows: TData[]) => Promise<void>;
  onUpdate?: (
    updates: Array<{ row: TData; column: string; value: unknown }>
  ) => Promise<void>;
  onRefresh?: () => void;
  onExport?: () => void;
  onAddRecord?: () => void;
  onShare?: () => void;
  onImport?: () => void;
  children?: React.ReactNode;
  enableBackground?: boolean;
}

interface EditableCellProps<TData> {
  getValue: () => any;
  row: Row<TData>;
  column: Column<TData, any>;
  table: TableType<TData>;
  onPendingChange: (rowId: string, columnId: string, value: any) => void;
}

// Extend the ColumnMeta type
declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends unknown, TValue> {
    editable?: boolean;
    type?:
      | "string"
      | "number"
      | "date"
      | "boolean"
      | "object"
      | "array"
      | "jsonb"
      | "json"
      | "boolean[]"
      | "number[]";
    primaryKey?: boolean;
    foreignKey?: boolean;
    unique?: boolean;
  }
}

// Utility functions for formatting and parsing values
function formatCellValue(value: unknown): any {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return formatDate(value);
  if (new Date(value as string).toString() !== "Invalid Date")
    return formatDate(new Date(value as string));
  if (typeof value === "number") return formatNumber(value);
  return formatString(value);
}

function formatDate(value: Date): string {
  if (value instanceof Date) {
    return format(value, "MMM dd, yyyy hh:mm a z");
  }
  return value;
}

function formatNumber(value: number): string {
  return value.toString();
}

function formatString(value: unknown): string {
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

function parseValue(value: string, type?: string): unknown {
  if (!type) return value;

  switch (type) {
    case "number":
      const num = Number(value);
      return isNaN(num) ? value : num;
    case "date":
      const date = new Date(value);
      return isNaN(date.getTime()) ? value : date;
    case "boolean":
      return value.toLowerCase() === "true";
    default:
      return value;
  }
}

export function DataTable<TData, TValue>({
  columns,
  data,
  toolbar = true,
  pagination = true,
  filterColumn,
  isLoading,
  searchKey,
  onPaginationChange,
  totalRows,
  pageIndex = 0,
  pageSize = 50,
  onDelete,
  onUpdate,
  onRefresh,
  onExport,
  onAddRecord,
  onShare,
  onImport,
  children,
  enableBackground = true,
  className,
  tableClassName,
}: DataTableProps<TData, TValue> & {
  className?: string;
  tableClassName?: string;
}) {
  const [paginationData, setPaginationData] = React.useState<PaginationState>({
    pageIndex: pageIndex,
    pageSize: pageSize,
  });

  React.useEffect(() => {
    if (onPaginationChange) {
      onPaginationChange(paginationData);
    }
  }, [paginationData]);

  // Initialize table first
  const table = useReactTable({
    data: data,
    columns,
    enableMultiRowSelection: true,
    state: {
      pagination: { pageIndex, pageSize },
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    enableRowSelection: true,
    manualPagination: true,
    pageCount: Math.ceil((totalRows ?? 0) / pageSize),
    onPaginationChange: setPaginationData,
  });

  return (
    <div className={cn("space-y-4 w-full grid", className)}>
      {isLoading && (
        <div className="flex justify-center items-center h-24">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}

      {!isLoading && (
        <>
          <div
            className={cn(
              "rounded-lg grid max-h-[calc(100vh-300px)] border border-border overflow-y-auto",
              `${tableClassName} ${enableBackground && "dark:bg-sidebar/10"}`
            )}
          >
            <Table className="w-full caption-bottom text-sm">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id + header.index}
                        className={cn(
                          "bg-[rgb(240,244,246)] px-4 py-1 overflow-hidden text-ellipsis whitespace-nowrap sticky top-0"
                        )}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id + row.index}
                      data-state={row.getIsSelected() && "selected"}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="cursor-pointer group relative bg-sidebar/90"
                    >
                      {row.getVisibleCells().map((cell, index) => (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "overflow-hidden text-ellipsis whitespace-nowrap px-4 py-4",
                            {
                              "min-w-[250px]":
                                cell.column.columnDef.meta?.type !==
                                  "boolean" &&
                                cell.column.columnDef.meta?.editable,
                              "min-w-[50px]":
                                // @ts-ignore
                                cell.column.columnDef.meta?.type === "checkbox",
                            }
                          )}
                        >
                          <div className="truncate">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {pagination && <DataTablePagination table={table} />}
        </>
      )}
    </div>
  );
}
