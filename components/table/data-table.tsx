import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronRight, Search, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataTableProps<DataType> {
  data: DataType[];
  columns: {
    header: string;
    accessorKey: keyof DataType;
    cell?: (row: any) => React.ReactNode;
    className?: string;
  }[];
  selectable?: boolean;
  selectedItems?: Set<string | number>;
  onSelectAll?: (checked: boolean) => void;
  onSelectItem?: (id: string | number) => void;
  getItemId: (item: DataType) => string | number;
  onSearch?: (query: string) => void;
  onSort?: (value: string) => void;
  sortOptions?: string[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    showingStart: number;
    showingEnd: number;
    totalItems: number;
    onNextPage: () => void;
    onPrevPage: () => void;
    itemsPerPage: number;
    onItemsPerPageChange: (value: string) => void;
  };
}

export function DataTable<T>({
  data,
  columns,
  selectable = false,
  selectedItems = new Set(),
  onSelectAll,
  onSelectItem,
  getItemId,
  onSearch,
  onSort,
  sortOptions,
  pagination,
}: DataTableProps<T>) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search"
                className="pl-9 w-[300px] border-gray-200"
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
          )}
          {onSort && sortOptions && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by</span>
              <Select onValueChange={onSort}>
                <SelectTrigger className="w-[180px] border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" className="text-gray-600">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50">
            {selectable && (
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedItems.size > 0 && selectedItems.size === data.length}
                  onCheckedChange={(checked) => onSelectAll?.(!!checked)}
                />
              </TableHead>
            )}
            {columns.map((column, index) => (
              <TableHead
                key={index}
                className={`font-medium text-gray-600 ${column.className || ''}`}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow
              key={getItemId(item)}
              className="hover:bg-gray-50 transition-colors"
            >
              {selectable && (
                <TableCell>
                  <Checkbox
                    checked={selectedItems.has(getItemId(item))}
                    onCheckedChange={() => onSelectItem?.(getItemId(item))}
                  />
                </TableCell>
              )}
              {columns.map((column, index) => (
                <TableCell key={index}>
                  {column.cell ? column.cell(item) : String(item[column.accessorKey])}
                </TableCell>
              ))}
            </TableRow>
          ))}
          {data.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={selectable ? columns.length + 1 : columns.length}
                className="h-24 text-center text-gray-600"
              >
                No data found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {pagination && (
        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Select
              value={String(pagination.itemsPerPage)}
              onValueChange={pagination.onItemsPerPageChange}
            >
              <SelectTrigger className="w-[70px] border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-600">per page</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Button
              variant="ghost"
              size="sm"
              onClick={pagination.onPrevPage}
              disabled={pagination.currentPage === 1}
              className="text-gray-600"
            >
              Previous
            </Button>
            <span>{pagination.currentPage} of {pagination.totalPages}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={pagination.onNextPage}
              disabled={pagination.currentPage === pagination.totalPages}
              className="text-gray-600"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
