"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LayoutGrid, Plus, Table } from 'lucide-react';
import { CourseTable } from '@/components/courses/CoursesTable';
import { CoursesCards } from '@/components/courses/CoursesCards';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useCourses } from '@/app/hooks/useCourses';

export default function ListCoursesPage() {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table'); // Estado para alternar entre tabelas e cards
  const { courses, enrollments, handleEnrollment } = useCourses(); // Usando hook customizado para pegar cursos e inscrições

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Lista de Cursos</h1>

        <div className="flex items-center space-x-4">
          {/* Controle de visualização */}
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(value) => {
              if (value) {
                setViewMode(value as 'table' | 'cards');
              }
            }}
            aria-label="Alternar visualização"
          >
            <ToggleGroupItem value="table" aria-label="Visualizar em Tabela">
              <Table className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="cards" aria-label="Visualizar em Cards">
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>

          {/* Botão para cadastro de cursos */}
          <Button asChild>
            <Link href="/courses/create">
              <Plus className="mr-2 h-4 w-4" />
              Novo Curso
            </Link>
          </Button>
        </div>
      </div>

      {/* Renderização condicional */}
      {viewMode === 'table' ? (
        <CourseTable courses={courses} enrollments={enrollments} handleEnrollment={handleEnrollment} />
      ) : (
        <CoursesCards courses={courses} enrollments={enrollments} handleEnrollment={handleEnrollment} />
      )}
    </div>
  );
}
