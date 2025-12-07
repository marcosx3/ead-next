// Exemplo simplificado de 'steps/CourseReview.tsx'
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function CourseReview({ data, onSubmit, isLoading }: any) {
	return (
		<div className="space-y-6">
			<h2 className="text-xl font-semibold">4. Revisão e Publicação</h2>
			
			<Card>
				<CardHeader><CardTitle>Detalhes do Curso</CardTitle></CardHeader>
				<CardContent>
					<p><strong>Título:</strong> {data.course.title}</p>
					<p><strong>Preço:</strong> R$ {data.course.price}</p>
					{/* ... outros dados do curso */}
				</CardContent>
			</Card>

			<Card>
				<CardHeader><CardTitle>Estrutura de Conteúdo ({data.modules.length} Módulos)</CardTitle></CardHeader>
				<CardContent>
					{data.modules.map((m: any, i: number) => (
						<p key={i}>**{m.title}** ({m.lessons.length} Aulas)</p>
					))}
				</CardContent>
			</Card>

			<Button 
				onClick={onSubmit} 
				disabled={isLoading} 
				className="w-full h-12 text-lg"
			>
				{isLoading ? (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						Salvando...
					</>
				) : (
					"Confirmar e Criar Curso Completo"
				)}
			</Button>
		</div>
	);
}