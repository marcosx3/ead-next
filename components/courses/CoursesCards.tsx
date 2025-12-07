// CoursesCards.tsx
import { Course } from '@/app/types/course'; // Importando o tipo correto
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CoursesCardsProps {
  courses: Course[]; // Cursos passados corretamente
  enrollments: Record<string, boolean>; // Inscrições como Record<string, boolean>
  handleEnrollment: (courseId: string | number, price: number) => Promise<void>; // Função de inscrição
}

export function CoursesCards({ courses, enrollments, handleEnrollment }: CoursesCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => {
        const isEnrolled = enrollments[course.id]; // Verificando se está inscrito
        return (
          <div key={course.id} className="border p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold">{course.title}</h3>
            <p className="text-sm">{course.slug}</p>
            <div className="mt-2">
              <Badge variant={course.is_paid ? 'default' : 'outline'}>
                {course.is_paid ? 'Pago' : 'Gratuito'}
              </Badge>
              <Badge variant={course.is_published ? 'default' : 'destructive'}>
                {course.is_published ? 'Publicado' : 'Rascunho'}
              </Badge>
            </div>
            <p className="mt-2">Preço: {course.price > 0
                ? `R$ ${(parseFloat(course.price.toString()) || 0).toFixed(2)}`
                : "Gratuito"}</p>
            <p className="mt-2">Pontos: {course.points_awarded}</p>
            <Button
              onClick={() => handleEnrollment(course.id, course.price)}
              disabled={isEnrolled}
              className="mt-4"
            >
              {isEnrolled ? 'Inscrito' : 'Inscrever'}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
