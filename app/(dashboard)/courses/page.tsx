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
  const [showEnrolledOnly, setShowEnrolledOnly] = useState(false); // Estado para mostrar apenas cursos aos quais o usuário está inscrito
  const { courses, enrollments, handleEnrollment } = useCourses(); // Usando hook customizado para pegar cursos e inscrições

  // Filtra os cursos para mostrar apenas os aos quais o usuário está inscrito
  const filteredCourses = showEnrolledOnly
    ? courses.filter(course => enrollments[Number(course.id)])
    : courses;

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

      {/* Botão para filtrar cursos aos quais o usuário está inscrito */}
      <div className="flex justify-between items-center">
        <Button onClick={() => setShowEnrolledOnly(!showEnrolledOnly)} variant="outline">
          {showEnrolledOnly ? 'Mostrar Todos os Cursos' : 'Mostrar Apenas Cursos Inscritos'}
        </Button>
      </div>

      {/* Renderização condicional */}
      {viewMode === 'table' ? (
        <CourseTable courses={filteredCourses} enrollments={enrollments} handleEnrollment={handleEnrollment} />
      ) : (
        <CoursesCards courses={filteredCourses} enrollments={enrollments} handleEnrollment={handleEnrollment} />
      )}
    </div>
  );
}
