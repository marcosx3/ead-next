// CourseTable.tsx
import { Course } from '@/app/types/course'; // Importando o tipo correto
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CourseTableProps {
  courses: Course[]; // Cursos passados corretamente
  enrollments: Record<string, boolean>; // Inscrições como Record<string, boolean>
  handleEnrollment: (courseId: string | number, price: number) => Promise<void>; // Função de inscrição
}

export function CourseTable({ courses, enrollments, handleEnrollment }: CourseTableProps) {
  return (
    <div>
      <table className="min-w-full table-auto">
        <thead>
          <tr>
            <th>Título</th>
            <th>Preço</th>
            <th>Publicado</th>
            <th>Pontos</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => {
            const isEnrolled = enrollments[course.id]; // Verificando se está inscrito
            return (
              <tr key={course.id}>
                <td>{course.title}</td>
                <td>{course.price > 0
                ? `R$ ${(parseFloat(course.price.toString()) || 0).toFixed(2)}`
                : "Gratuito"}</td>
                <td>{course.is_published ? 'Sim' : 'Não'}</td>
                <td>{course.points_awarded}</td>
                <td>
                  <Button
                    onClick={() => handleEnrollment(course.id, course.price)}
                    disabled={isEnrolled}
                  >
                    {isEnrolled ? 'Inscrito' : 'Inscrever'}
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
