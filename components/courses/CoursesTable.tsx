'use client';

import { useState } from 'react';
import { Course } from '@/app/types/course';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface CourseTableProps {
	courses: Course[];
	enrollments: Record<string, boolean>;
	handleEnrollment: (courseId: string | number, price: number) => Promise<void>;
}

export function CourseTable({
	courses,
	enrollments,
	handleEnrollment,
}: CourseTableProps) {
	const [search, setSearch] = useState('');

	// 🔍 Filtra cursos pelo título
	const filteredCourses = courses.filter((course) =>
		course.title.toLowerCase().includes(search.toLowerCase())
	);

	return (
		<div className="space-y-4">
			{/* Campo de pesquisa */}
			<input
				type="text"
				placeholder="Pesquisar curso..."
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				className="w-full max-w-sm rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
			/>

			<div className="overflow-x-auto">
				<table className="min-w-full table-auto">
					<tbody>
						{filteredCourses.map((course) => {
							const isEnrolled = enrollments[Number(course.id)];

							return (
								<tr key={course.id} className="border-b">
									<td className="p-2">{course.title}</td>
									<td className="p-2">
										{course.price > 0
											? `R$ ${Number(course.price).toFixed(2)}`
											: 'Gratuito'}
									</td>
									<td className="p-2">
										{course.is_published ? 'Sim' : 'Não'}
									</td>
									<td className="p-2 text-center">
										{course.points_awarded}
									</td>
									<td className="p-2">
										<div className="flex justify-end">
											{isEnrolled ? (
												<Link href={`/courses/watch?course_id=${course.id}`}>
													<Button variant="secondary" size="sm">
														Assistir
													</Button>
												</Link>
											) : (
												<Button
													onClick={() =>
														handleEnrollment(course.id, course.price)
													}
													variant="outline"
													size="sm"
												>
													{course.price > 0 ? 'Inscrever-se' : 'Grátis'}
												</Button>
											)}
										</div>
									</td>
								</tr>
							);
						})}

						{filteredCourses.length === 0 && (
							<tr>
								<td colSpan={5} className="p-4 text-center text-sm text-muted-foreground">
									Nenhum curso encontrado
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
