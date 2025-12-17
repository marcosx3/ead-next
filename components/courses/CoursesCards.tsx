'use client';

import { Course } from '@/app/types/course';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useState } from 'react';

interface CoursesCardsProps {
  courses: Course[];
  enrollments: Record<string, boolean>;
  handleEnrollment: (courseId: string | number, price: number) => Promise<void>;
}

export function CoursesCards({
  courses,
  enrollments,
  handleEnrollment,
}: CoursesCardsProps) {
  const [search, setSearch] = useState('');

  // 🔍 Filtro por título
  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Campo de pesquisa */}
      <input
        type="text"
        placeholder="Pesquisar curso..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm rounded-md border px-3 py-2 text-sm
                   focus:outline-none focus:ring-2 focus:ring-primary"
      />

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => {
          const isEnrolled = enrollments[Number(course.id)];

          return (
            <div key={course.id} className="border p-4 rounded-lg shadow-md">
              {/* Título */}
              <h2 className="text-xl font-semibold">{course.title}</h2>

              {/* Descrição */}
              <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                {course.description}
              </p>

              {/* Badges */}
              <div className="flex items-center gap-2 mt-3">
                {course.points_awarded && (
                  <Badge>{course.points_awarded} pts</Badge>
                )}

                {course.price > 0 ? (
                  <Badge variant="outline">R$ {course.price}</Badge>
                ) : (
                  <Badge variant="secondary">Gratuito</Badge>
                )}
              </div>

              {/* Botão */}
              {isEnrolled ? (
                <Link href={`/courses/watch?course_id=${course.id}`}>
                  <Button className="mt-4 w-full" variant="secondary">
                    Assistir
                  </Button>
                </Link>
              ) : (
                <Button
                  onClick={() =>
                    handleEnrollment(course.id, course.price)
                  }
                  className="mt-4 w-full"
                  variant="outline"
                >
                  {course.price > 0
                    ? 'Inscrever-se'
                    : 'Inscrição Gratuita'}
                </Button>
              )}
            </div>
          );
        })}

        {filteredCourses.length === 0 && (
          <p className="col-span-full text-center text-sm text-muted-foreground">
            Nenhum curso encontrado
          </p>
        )}
      </div>
    </div>
  );
}
