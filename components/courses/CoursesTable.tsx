"use client";

import { useState, useEffect } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  PaginationState,
  useReactTable
} from "@tanstack/react-table";

import { Course } from "@/app/types/course";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Link from "next/link";

// ======================================
// COLUNAS
// ======================================
export const courseColumns: ColumnDef<Course>[] = [
  {
    accessorKey: "title",
    header: "Título",
  },
  {
    accessorKey: "slug",
    header: "Slug",
  },
  {
    accessorKey: "is_paid",
    header: "Pago?",
    cell: ({ row }) => {
      const paid = row.getValue("is_paid") as boolean;
      return (
        <Badge variant={paid ? "default" : "outline"}>
          {paid ? "PAGO" : "GRATUITO"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "price",
    header: "Preço",
    cell: ({ row }) => {
      const price = row.getValue("price") as number;
      return price > 0 ? `R$ ${price.toFixed(2)}` : "-";
    },
  },
  {
    accessorKey: "is_published",
    header: "Publicado?",
    cell: ({ row }) => {
      const pub = row.getValue("is_published") as boolean;
      return (
        <Badge variant={pub ? "default" : "destructive"}>
          {pub ? "PUBLICADO" : "RASCUNHO"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "points_awarded",
    header: "Pontos",
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => {
      const course = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end">

            <DropdownMenuItem asChild>
              <Link href={`/courses/edit/${course.id}`}>Editar</Link>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => console.log("Excluir curso:", course.id)}
            >
              Excluir
            </DropdownMenuItem>

          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];


// ======================================
// TABLE COMPONENT
// ======================================
export function CourseTable() {
  const [data, setData] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const baseAPI = process.env.NEXT_PUBLIC_API_BASE_URL;
  
  const API_URL = baseAPI! + "/courses";

  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await fetch(API_URL);
        const courses = await res.json();
        setData(courses);
      } catch (err) {
        console.error("Erro ao carregar cursos:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  const table = useReactTable({
    data,
    columns: courseColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      globalFilter,
      pagination,
    },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
  });

  if (loading)
    return <div className="py-8 text-center">Carregando cursos...</div>;

  return (
    <div>
      {/* BUSCA */}
      <div className="flex items-center py-4">
        <Input
          placeholder="Buscar cursos..."
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* TABELA */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
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
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={courseColumns.length}
                  className="text-center py-10"
                >
                  Nenhum curso encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINAÇÃO */}
      <div className="flex items-center justify-end space-x-2 py-4">

        <div className="flex-1 text-sm text-muted-foreground">
          Página {table.getState().pagination.pageIndex + 1} de{" "}
          {table.getPageCount()}
        </div>

        <div className="space-x-2">

          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>

        </div>
      </div>

    </div>
  );
}
