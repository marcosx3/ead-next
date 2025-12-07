"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const CreateCourseSchema = z.object({
	title: z.string().min(4, "Título deve ter mais que 3 caracteres."),
	slug: z.string().min(2, "Slug é obrigatório."),
	description: z.string().min(4, "Descrição deve ser maior que 3 caracteres."),
	is_paid: z.boolean(),
	price: z.number().nonnegative("O preço deve ser um número positivo."),
	is_published: z.boolean(),
	points_awarded: z.number().min(0, "Pontuação deve ser positiva."),
});

type CreateCourseFormData = z.infer<typeof CreateCourseSchema>;

export default function CreateCoursePage() {

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<CreateCourseFormData>({
		resolver: zodResolver(CreateCourseSchema),
	});

	const onSubmit = async (data: CreateCourseFormData) => {
		const baseAPI = process.env.NEXT_PUBLIC_API_BASE_URL;
  		const API_URL = baseAPI! + "/courses";

		try {
			const response = await fetch(API_URL, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				throw new Error(`Erro: ${response.status}`);
			}

			const result = await response.json();
			toast.success("Curso criado com sucesso!");
		} catch (error) {
			toast.error("Não foi possível criar o curso.");
		}
	};


	return (
		<div className="space-y-6 max-w-2xl mx-auto py-8">
			<h1 className="text-2xl font-semibold">Criar Novo Curso</h1>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
				{/* Title */}
				<div className="space-y-2">
					<label className="text-sm font-medium">Título</label>
					<input
						{...register("title")}
						type="text"
						placeholder="Nome do curso"
						className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
					/>
					{errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
				</div>

				{/* Slug */}
				<div className="space-y-2">
					<label className="text-sm font-medium">Slug</label>
					<input
						{...register("slug")}
						type="text"
						placeholder="ex: curso-de-react"
						className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
					/>
					{errors.slug && <p className="text-red-500 text-sm">{errors.slug.message}</p>}
				</div>

				{/* Description */}
				<div className="space-y-2">
					<label className="text-sm font-medium">Descrição</label>
					<textarea
						{...register("description")}
						rows={4}
						placeholder="Descrição do curso"
						className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
					/>
					{errors.description && (
						<p className="text-red-500 text-sm">{errors.description.message}</p>
					)}
				</div>

				{/* is_paid */}
				<div className="flex items-center gap-2">
					<input type="checkbox" {...register("is_paid")} />
					<label className="text-sm font-medium">Curso Pago?</label>
				</div>

				{/* Price */}
				<div className="space-y-2">
					<label className="text-sm font-medium">Preço</label>
					<input
						{...register("price", { valueAsNumber: true })}
						type="number"
						placeholder="Valor do curso"
						className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
					/>
					{errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
				</div>

				{/* is_published */}
				<div className="flex items-center gap-2">
					<input type="checkbox" {...register("is_published")} />
					<label className="text-sm font-medium">Publicado?</label>
				</div>

				{/* Points awarded */}
				<div className="space-y-2">
					<label className="text-sm font-medium">Pontos ao Concluir</label>
					<input
						{...register("points_awarded", { valueAsNumber: true })}
						type="number"
						placeholder="Ex: 100"
						className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
					/>
					{errors.points_awarded && (
						<p className="text-red-500 text-sm">{errors.points_awarded.message}</p>
					)}
				</div>

				<Button type="submit" className="w-full">Criar Curso</Button>
			</form>
		</div>
	);
}
