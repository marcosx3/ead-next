"use client";

import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch"; // Usando Switch do shadcn/ui

// O Schema de validação Zod (igual ao seu original)
const CourseSchema = z.object({
	title: z.string().min(4, "Título deve ter mais que 3 caracteres."),
	slug: z.string().min(2, "Slug é obrigatório."),
	description: z.string().min(4, "Descrição deve ser maior que 3 caracteres."),
	is_paid: z.boolean(),
	// Garante que se for pago, o preço seja positivo, se não, pode ser 0
	price: z.number().nonnegative("O preço deve ser um número positivo ou zero."),
	is_published: z.boolean(),
	points_awarded: z.number().min(0, "Pontuação deve ser positiva."),
}).superRefine((data, ctx) => {
	if (data.is_paid === true) {
        if (!data.price || data.price <= 0) {
            ctx.addIssue({
              	code: z.ZodIssueCode.custom,
                message: "O preço é obrigatório e deve ser maior que zero para cursos pagos.",
                path: ['price'], // Associa o erro ao campo 'price'
            });
        }
    }
});
type CourseFormData = z.infer<typeof CourseSchema>;

// O componente agora recebe 'onNext' para passar os dados para o Wizard
export default function CourseForm({ initialData, onNext }: { initialData: CourseFormData, onNext: (data: CourseFormData) => void }) {

	const {
		control,
		register,
		handleSubmit,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<CourseFormData>({
		resolver: zodResolver(CourseSchema),
		// Define os valores iniciais (útil se o usuário voltar à etapa 1)
		defaultValues: initialData, 
	});

	// Observa o valor de is_paid em tempo real para controle da interface
	const isPaid = watch("is_paid", initialData.is_paid);
	
	// 💡 Submissão: Não chama a API, mas sim o callback 'onNext'
	const onSubmit = (data: CourseFormData) => {
		onNext(data);
	};


	return (
		<Card>
			<CardHeader>
				<CardTitle>1. Informações Básicas do Curso</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
					
					{/* Title */}
					<div className="space-y-2">
						<Label htmlFor="title">Título</Label>
						<Input
							{...register("title")}
							id="title"
							type="text"
							placeholder="Nome do curso"
						/>
						{errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
					</div>

					{/* Slug */}
					<div className="space-y-2">
						<Label htmlFor="slug">Slug (URL)</Label>
						<Input
							{...register("slug")}
							id="slug"
							type="text"
							placeholder="ex: curso-de-react"
						/>
						{errors.slug && <p className="text-red-500 text-sm">{errors.slug.message}</p>}
					</div>

					{/* Description */}
					<div className="space-y-2">
						<Label htmlFor="description">Descrição</Label>
						<Textarea
							{...register("description")}
							id="description"
							rows={4}
							placeholder="Descrição detalhada do curso"
						/>
						{errors.description && (
							<p className="text-red-500 text-sm">{errors.description.message}</p>
						)}
					</div>

					{/* Controle de Preço e Acesso */}
					<div className="grid grid-cols-2 gap-6 pt-4 border-t">
						
						{/* is_paid */}
						<div className="flex items-center space-x-2">
							{/* O Radix Switch não precisa do htmlFor, mas o Controller precisa do ID para funcionar bem com o Label */}
							<Controller
								name="is_paid"
								control={control}
								render={({ field }) => (
									<Switch 
										id="is_paid" 
										// O Controller passa os props: checked e onCheckedChange (que é o onChange para o Switch)
										checked={field.value} 
										onCheckedChange={field.onChange} 
									/>
								)}
							/>
							{/* O Label agora deve funcionar corretamente com o ID do Switch */}
							<Label 
								htmlFor="is_paid" 
								className="font-medium"
							>
								Curso Pago?
							</Label>
						</div>
						
						{/* Price */}
						<div className="space-y-2">
							<Label htmlFor="price">Preço (R$)</Label>
							<Input
								{...register("price", { valueAsNumber: true })}
								id="price"
								type="number"
								step="0.01"
								placeholder="0.00"
								readOnly={!isPaid}
							/>
							{errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
						</div>
					</div>


					{/* is_published & Points awarded */}
					<div className="grid grid-cols-2 gap-6">
						{/* is_published */}
						<div className="flex items-center space-x-2">
							<Switch 
								id="is_published" 
								{...register("is_published")} 
							/>
							<Label htmlFor="is_published" className="font-medium">Publicado (Visível)?</Label>
						</div>
						
						{/* Points awarded */}
						<div className="space-y-2">
							<Label htmlFor="points_awarded">Pontos ao Concluir</Label>
							<Input
								{...register("points_awarded", { valueAsNumber: true })}
								id="points_awarded"
								type="number"
								placeholder="Ex: 100"
							/>
							{errors.points_awarded && (
								<p className="text-red-500 text-sm">{errors.points_awarded.message}</p>
							)}
						</div>
					</div>
					
					<Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
						Próxima Etapa: Estrutura do Conteúdo
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}