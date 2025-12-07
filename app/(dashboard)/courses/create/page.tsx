'use client';

import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from 'sonner';

// Importe os componentes de etapa (criaremos a seguir)
import CourseForm from '@/components/courses/CourseForm';
import ModulesAndLessonsForm from '@/components/courses/ModulesAndLessonsForm';
import QuizAndQuestionsForm from '@/components/courses/QuizAndQuestionsForm';
import CourseReview from '@/components/courses/CourseReview';
import { useRouter } from 'next/navigation';
// Definir o tipo de dado que será acumulado durante o processo
type CourseCreationData = {
	course: {
		title: string;
		slug: string;
		description: string;
		is_paid: boolean;
		price: number; // Importante ser inicializado como number
		is_published: boolean;
		points_awarded: number;
	}; 
	modules: any[]; // Módulos com suas Aulas
	quizzes: any[]; // Perguntas e Respostas
	courseId?: number; // ID retornado após a criação do curso
};
export default function CourseCreatorWizard() {
	
	const router = useRouter();
	const [currentStep, setCurrentStep] = useState("course");
	const [courseData, setCourseData] = useState<CourseCreationData>({
		course: {
			title: '',
			slug: '',
			description: '',
			is_paid: false,
			price: 0, 
			is_published: false,
			points_awarded: 0,
		},
		modules: [],
		quizzes: [],
	});
	const [isLoading, setIsLoading] = useState(false);

	// Função para avançar para o próximo passo
	const goToNextStep = (nextStep: string, data: any, stepName: string) => {
		setCourseData(prev => ({
			...prev,
			[stepName]: data,
		}));
		setCurrentStep(nextStep);
		toast.info(`Etapa ${stepName} concluída!`);
	};

	// Função para submissão final
	const handleFinalSubmit = async () => {
		setIsLoading(true);

		const baseAPI = process.env.NEXT_PUBLIC_API_BASE_URL;
		const API_URL = baseAPI! + "courses/course-full";
		try {
			const token = localStorage.getItem('access_token');
			if (!token) {
				toast.error("Sessão expirada ou não autenticada. Faça login novamente.");
				setIsLoading(false);
				return; 
			}
			const response = await fetch(API_URL, { 
			method: "POST",
					headers: {
						"Content-Type": "application/json",
						"Authorization": `Bearer ${token}`,
					},
					body: JSON.stringify(courseData),});
			if (!response.ok) throw new Error("Erro ao criar curso");

			toast.success("Curso criado com sucesso!");
			router.push("/courses");
		} catch (error) {
			toast.error("curso não cadastrado: " + error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="space-y-6">
			<h1 className="text-3xl font-bold">Criador de Conteúdo do Curso 📚</h1>
			
			<Tabs value={currentStep} onValueChange={setCurrentStep}>
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="course" disabled={isLoading}>1. Dados Básicos</TabsTrigger>
					<TabsTrigger value="modules" disabled={isLoading}>2. Estrutura (Módulos/Aulas)</TabsTrigger>
					<TabsTrigger value="quiz" disabled={isLoading}>3. Quizzes/Perguntas</TabsTrigger>
					<TabsTrigger value="review" disabled={isLoading}>4. Revisão/Publicar</TabsTrigger>
				</TabsList>

				{/* ETAPA 1: Dados do Curso (Você já tem quase pronto!) */}
				<TabsContent value="course">
					<CourseForm 
						initialData={courseData.course}
						onNext={(data) => goToNextStep("modules", data, "course")}
						// Note que o `CourseForm` anterior deve ser ligeiramente ajustado
						// para usar `onNext` em vez de submeter diretamente.
					/>
				</TabsContent>

				{/* ETAPA 2: Módulos e Aulas */}
				<TabsContent value="modules">
					<ModulesAndLessonsForm
						initialData={courseData.modules}
						onNext={(data) => goToNextStep("quiz", data, "modules")}
					/>
				</TabsContent>

				{/* ETAPA 3: Perguntas e Respostas */}
				<TabsContent value="quiz">
					<QuizAndQuestionsForm
						initialData={courseData.quizzes}
						onNext={(data) => goToNextStep("review", data, "quizzes")}
					/>
				</TabsContent>

				{/* ETAPA 4: Revisão Final */}
				<TabsContent value="review">
					<CourseReview 
						data={courseData} 
						onSubmit={handleFinalSubmit}
						isLoading={isLoading}
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
}