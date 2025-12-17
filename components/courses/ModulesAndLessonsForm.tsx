import {
	useForm,
	useFieldArray,
	FormProvider,
	useFormContext,
	useWatch,
	FieldArrayWithId
} from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Trash2, PlusCircle, Lock, Unlock, Upload, Link as LinkIcon, FileVideo } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label'; // Recomendado adicionar Label para acessibilidade
import { toast } from 'sonner';
import axios from "axios";

// --- TIPAGENS ---
type Lesson = {
	title: string;
	lesson_type: 'video' | 'text' | 'quiz';
	content: string;
	is_free_preview: boolean;
	video_url?: string;
};

type Module = {
	title: string;
	lessons: Lesson[];
};

type FormSchema = {
	modules: Module[];
};

// =========================================================
// COMPONENTE PAI: ModulesAndLessonsForm
// =========================================================

export default function ModulesAndLessonsForm({ initialData, onNext }: { initialData: any, onNext: (data: any) => void }) {
	const methods = useForm<FormSchema>({
		defaultValues: {
			modules: initialData && initialData.length > 0
				? initialData
				: [{ title: "Módulo 1", lessons: [] }]
		}
	});

	const { control, handleSubmit } = methods;

	const { fields: moduleFields, append: appendModule, remove: removeModule } = useFieldArray({
		control,
		name: "modules"
	});

	const onSubmit = (data: FormSchema) => {
		// Limpeza opcional: remover video_url se o tipo não for video, etc.
		onNext(data.modules);
	};

	return (
		<FormProvider {...methods}>
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl mx-auto py-6">
				<div className="flex justify-between items-center">
					<h2 className="text-2xl font-bold tracking-tight">Conteúdo do Curso</h2>
					<Button type="button" onClick={() => appendModule({ title: `Módulo ${moduleFields.length + 1}`, lessons: [] })}>
						<PlusCircle className="mr-2 h-4 w-4" /> Novo Módulo
					</Button>
				</div>

				<div className="space-y-6">
					{moduleFields.map((module, moduleIndex) => (
						<Card key={module.id} className="border-l-4 border-l-blue-600 shadow-sm">
							<CardHeader className="flex flex-row items-center justify-between bg-slate-50/50 pb-4">
								<div className="flex-1 mr-4">
									<Label className="text-xs text-muted-foreground uppercase font-bold mb-1 block">Título do Módulo</Label>
									<Input
										{...methods.register(`modules.${moduleIndex}.title`)}
										placeholder="Ex: Introdução ao Marketing"
										className="font-semibold text-lg bg-white"
									/>
								</div>
								<Button type="button" variant="ghost" onClick={() => removeModule(moduleIndex)} size="icon" className="text-muted-foreground hover:text-red-500">
									<Trash2 className="h-5 w-5" />
								</Button>
							</CardHeader>
							<CardContent className="pt-4">
								<LessonFieldArray moduleIndex={moduleIndex} />
							</CardContent>
						</Card>
					))}
				</div>

				<div className="sticky bottom-0 bg-white/80 backdrop-blur-sm p-4 border-t mt-8 z-10">
					<Button type="submit" size="lg" className="w-full md:w-auto md:float-right">
						Salvar e Continuar
					</Button>
				</div>
			</form>
		</FormProvider>
	);
}

// =========================================================
// SUB-COMPONENTE: LessonFieldArray
// =========================================================

function LessonFieldArray({ moduleIndex }: { moduleIndex: number }) {
	const { control } = useFormContext<FormSchema>();

	const { fields: lessonFields, append: appendLesson, remove: removeLesson } = useFieldArray({
		control,
		name: `modules.${moduleIndex}.lessons` as const
	});

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
					<FileVideo className="h-4 w-4" /> Aulas ({lessonFields.length})
				</h4>
			</div>

			<div className="space-y-3">
				{lessonFields.map((field, lessonIndex) => (
					<LessonItem
						key={field.id}
						field={field}
						moduleIndex={moduleIndex}
						lessonIndex={lessonIndex}
						removeLesson={removeLesson}
					/>
				))}

				{lessonFields.length === 0 && (
					<div className="text-center py-8 border-2 border-dashed rounded-lg bg-slate-50 text-slate-400">
						<p className="text-sm">Nenhuma aula neste módulo ainda.</p>
					</div>
				)}
			</div>

			<Button
				type="button"
				variant="outline"
				size="sm"
				className="w-full border-dashed border-2 hover:border-blue-500 hover:text-blue-600"
				onClick={() => appendLesson({
					title: "",
					lesson_type: 'video',
					content: "",
					is_free_preview: false,
					video_url: undefined
				})}
			>
				<PlusCircle className="mr-2 h-4 w-4" /> Adicionar Aula
			</Button>
		</div>
	);
}

// =========================================================
// SUB-COMPONENTE: LessonItem (Lógica refatorada de Vídeo)
// =========================================================

type LessonItemProps = {
	field: FieldArrayWithId<FormSchema, `modules.${number}.lessons`, "id">;
	moduleIndex: number;
	lessonIndex: number;
	removeLesson: (index: number) => void;
}

function LessonItem({ field, moduleIndex, lessonIndex, removeLesson }: LessonItemProps) {
	const { register, control, setValue, getValues } = useFormContext<FormSchema>();

	// Caminhos dos campos para facilitar
	const typeName = `modules.${moduleIndex}.lessons.${lessonIndex}.lesson_type` as const;
	const urlName = `modules.${moduleIndex}.lessons.${lessonIndex}.video_url` as const;
	const previewName = `modules.${moduleIndex}.lessons.${lessonIndex}.is_free_preview` as const;

	// -- VIGILANTES (Watchers) --
	// Monitora o tipo da lição
	const lessonType = useWatch({ control, name: typeName });
	// Monitora o estado do preview para atualizar o ícone
	const isFreePreview = useWatch({ control, name: previewName });
	// Monitora a URL atual (para saber se já tem algo preenchido)
	const currentVideoUrl = useWatch({ control, name: urlName });

	// -- ESTADOS LOCAIS --
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [videoSource, setVideoSource] = useState<'url' | 'upload'>('url');

	// Efeito para sincronizar a aba correta se carregarmos dados iniciais
	useEffect(() => {
		// Lógica simples: se existir URL e não começarmos um upload, verificamos o padrão
		// Isso é opcional, serve mais para edição de dados existentes
		if (currentVideoUrl && !currentVideoUrl.includes('blob') && !videoSource) {
			setVideoSource('url');
		}
	}, []);

	// -- HANDLERS --
	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setIsUploading(true);
		setUploadProgress(0);

		try {
			const url = await UploadVideo(file, (percent) => {
				setUploadProgress(percent);
			});

			setValue(urlName, url, { shouldDirty: true });

		} catch {
			alert("Falha ao enviar vídeo");
		} finally {
			setIsUploading(false);
		}
	};


	const UploadVideo = async (
		file: File,
		onProgress: (percent: number) => void
	): Promise<string> => {
		const baseAPI = process.env.NEXT_PUBLIC_API_BASE_URL;
		const API_URL = `${baseAPI}lessons/video`;
		const token = localStorage.getItem("access_token");
		console.log(API_URL);
		const formData = new FormData();
		formData.append("file", file);

		try {
			const response = await axios.post(
				API_URL,
				formData,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "multipart/form-data",
					},
					onUploadProgress: (progressEvent) => {
						if (!progressEvent.total) return;
						const percent = Math.round(
							(progressEvent.loaded * 100) / progressEvent.total
						);
						onProgress(percent);
					},
				}
			);

			return response.data.path;

		} catch (err) {
			console.error("Erro ao enviar vídeo:", err);

			if (axios.isAxiosError(err)) {
					console.log("Response:", err.response);
					console.log("Status:", err.response?.status);
					console.log("Data:", err.response?.data);

					alert(`Erro ao enviar vídeo: ${err.response?.data?.message || "Erro desconhecido"}`);
				} else {
					alert("Erro inesperado ao enviar vídeo.");
				}
				
			throw err;
		}
	};


	return (
		<div className="flex gap-4 p-4 border rounded-lg bg-white shadow-sm items-start transition-all hover:shadow-md">
			{/* Indicador Numérico */}
			<div className="flex flex-col items-center gap-2 pt-2">
				<span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
					{lessonIndex + 1}
				</span>
				{/* Ícone reativo do cadeado */}
				<div title={isFreePreview ? "Aula Aberta" : "Aula Bloqueada"}>
					{isFreePreview
						? <Unlock className="h-4 w-4 text-green-500" />
						: <Lock className="h-4 w-4 text-slate-300" />
					}
				</div>
			</div>

			<div className="flex-grow space-y-4">
				{/* Linha 1: Título e Tipo */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
					<div className="md:col-span-2">
						<Input
							{...register(`modules.${moduleIndex}.lessons.${lessonIndex}.title`)}
							placeholder="Título da Aula"
							className="font-medium"
						/>
					</div>
					<div>
						<select
							{...register(typeName)}
							className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						>
							<option value="video">Vídeo</option>
							<option value="text">Texto</option>
							<option value="quiz">Quiz</option>
						</select>
					</div>
				</div>

				{/* Linha 2: Conteúdo Específico */}

				{/* --- TIPO TEXTO --- */}
				{lessonType === 'text' && (
					<Textarea
						{...register(`modules.${moduleIndex}.lessons.${lessonIndex}.content`)}
						placeholder="Escreva o conteúdo da aula aqui..."
						rows={4}
					/>
				)}

				{/* --- TIPO VIDEO (COM ABAS DE SELEÇÃO) --- */}
				{lessonType === 'video' && (
					<div className="p-4 bg-slate-50 rounded-md border space-y-3">
						<div className="flex items-center justify-between mb-2">
							<Label className="text-xs font-semibold uppercase text-slate-500">Origem do Vídeo</Label>

							{/* Toggle Link vs Upload */}
							<div className="flex bg-slate-200 p-1 rounded-md">
								<button
									type="button"
									onClick={() => setVideoSource('url')}
									className={`px-3 py-1 text-xs font-medium rounded-sm transition-all ${videoSource === 'url' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
								>
									<span className="flex items-center gap-1"><LinkIcon className="w-3 h-3" /> Link Externo</span>
								</button>
								<button
									type="button"
									onClick={() => setVideoSource('upload')}
									className={`px-3 py-1 text-xs font-medium rounded-sm transition-all ${videoSource === 'upload' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
								>
									<span className="flex items-center gap-1"><Upload className="w-3 h-3" /> Upload Arquivo</span>
								</button>
							</div>
						</div>

						{/* Opção A: Inserir Link */}
						{videoSource === 'url' && (
							<div className="space-y-2 animate-in fade-in zoom-in-95 duration-300">
								<Input
									{...register(urlName)}
									placeholder="https://youtube.com/watch?v=..."
								/>
								<p className="text-[11px] text-muted-foreground">Cole o link direto do YouTube, Vimeo ou PandaVideo.</p>
							</div>
						)}

						{/* Opção B: Upload */}
						{videoSource === 'upload' && (
							<div className="space-y-2 animate-in fade-in zoom-in-95 duration-300">
								<div className="flex gap-2">
									<Input
										type="file"
										accept="video/*"
										onChange={handleFileUpload}
										disabled={isUploading}
										className="cursor-pointer file:text-blue-600 file:font-semibold"
									/>
								</div>
								{isUploading && <p className="text-xs text-blue-600 animate-pulse">Enviando vídeo...</p>}

								{/* Mostra a URL gerada (somente leitura ou editável, conforme sua regra) */}
								{currentVideoUrl && !isUploading && (
									<div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded border border-green-100">
										<div className="font-bold">Vídeo anexado!</div>
										<div className="truncate max-w-[200px] text-slate-500">{currentVideoUrl}</div>
									</div>
								)}
							</div>
						)}

						<Textarea
							{...register(`modules.${moduleIndex}.lessons.${lessonIndex}.content`)}
							placeholder="Descrição do vídeo (opcional)"
							rows={2}
							className="bg-white mt-2"
						/>
					</div>
				)}
				{isUploading && (
					<div className="w-full bg-slate-200 h-2 rounded">
						<div
							className="bg-blue-600 h-2 rounded transition-all"
							style={{ width: `${uploadProgress}%` }}
						/>
					</div>
				)}

				{isUploading && (
					<p className="text-xs text-blue-600">{uploadProgress}%</p>
				)}

				{/* Checkbox de Preview - Usando Controller ou register manual com watch */}
				<div className="flex items-center space-x-2 pt-1">
					<Checkbox
						id={`free-preview-${field.id}`}
						checked={isFreePreview}
						onCheckedChange={(checked) => {
							setValue(previewName, !!checked, { shouldDirty: true });
						}}
					/>
					<label
						htmlFor={`free-preview-${field.id}`}
						className={`text-sm font-medium leading-none cursor-pointer select-none ${isFreePreview ? 'text-green-600' : 'text-slate-500'}`}
					>
						Permitir visualização gratuita (Preview)
					</label>
				</div>
			</div>

			<Button
				type="button"
				variant="ghost"
				size="icon"
				onClick={() => removeLesson(lessonIndex)}
				className="text-slate-400 hover:text-red-500 hover:bg-red-50"
			>
				<Trash2 className="h-4 w-4" />
			</Button>
		</div>
	);
}