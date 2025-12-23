"use client";

import { useState, useEffect, useCallback } from "react"; // Adicionado useCallback
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Lesson } from "@/app/types/lessons";
import { PlayCircle, FileText, ChevronRight, CheckCircle, Loader2 } from "lucide-react";
import LessonQuestions from "@/components/courses/LessonQuestions";
import { Module } from "@/app/types/modules";
import { Course } from "@/app/types/course";

// Definindo a estrutura de resposta que o backend envia
interface WatchCourseResponse {
    course: Course;
    completedLessonIds: number[];
}

const WatchCourse = () => {
    const searchParams = useSearchParams();
    const course_id = searchParams.get("course_id");

    const [course, setCourse] = useState<Course | null>(null);
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState(true);
    const [progressPercentage, setProgressPercentage] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false); // Novo estado para o botão de conclusão

    // ===============================
    // Calcular Progresso
    // ===============================
    const calculateProgress = (courseData: Course) => {
        if (!courseData || !courseData.modules) return 0;

        const allLessons = (courseData.modules || []).flatMap(
            (module) => module.lessons || []
        );
        const totalLessons = allLessons.length;

        if (totalLessons === 0) return 0;

        const completedLessons = allLessons.filter(
            (lesson: any) => lesson.completed 
        ).length;

        const progress = (completedLessons / totalLessons) * 100;
        return Math.round(progress);
    };

    // ===============================
    // Fetch do curso (Função extraída e reescrita para reuso)
    // ===============================
    const fetchCourse = useCallback(async () => {
        if (!course_id) return;

        const baseAPI = process.env.NEXT_PUBLIC_API_BASE_URL;
        const API_URL = `${baseAPI}courses/watch/${course_id}`;
        const token = localStorage.getItem("access_token");

        if (!token) {
            toast.error("Sessão expirada.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(API_URL, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error("Falha ao carregar curso.");
            }

            const apiResponse: WatchCourseResponse = await response.json();
            
            // 1. EXTRAI O OBJETO DO CURSO E ID'S CONCLUÍDOS
            const courseData = apiResponse.course;
            const completedIds = apiResponse.completedLessonIds || [];

            // 2. ADICIONA O STATUS 'completed' às lessons
            const updatedModules: Module[] = (courseData.modules || []).map(module => ({
                ...module,
                lessons: (module.lessons || []).map(lesson => ({
                    ...lesson,
                    // Adiciona a propriedade 'completed' com base na lista de IDs
                    completed: completedIds.includes(Number(lesson.id)) 
                }))
            }));

            const finalCourseData: Course = { ...courseData, modules: updatedModules };

            // 3. ATUALIZA O ESTADO COM OS DADOS PROCESSADOS
            setCourse(finalCourseData);

            const calculatedProgress = calculateProgress(finalCourseData);
            setProgressPercentage(calculatedProgress);

            // 4. SELECIONA A PRIMEIRA AULA (ou mantém a ativa se ainda existir)
            const firstLesson = finalCourseData.modules?.[0]?.lessons?.[0] || null;
            
            // Tenta manter a aula ativa após o re-fetch
            const currentActiveLessonId = activeLesson?.id;
            const reFoundActiveLesson = finalCourseData.modules?.flatMap(m => m.lessons || []).find(l => l.id === currentActiveLessonId);

            setActiveLesson(reFoundActiveLesson || firstLesson);

        } catch (error) {
            console.error("Erro no Fetch:", error);
            toast.error("Erro ao carregar o curso.");
        } finally {
            setLoading(false);
        }
    }, [course_id, activeLesson?.id]); // Adicionado activeLesson.id para re-seleção após re-fetch


    // ===============================
    // Função para Marcar Aula Concluída
    // ===============================
    const markLessonAsCompleted = async () => {
    if (!activeLesson || (activeLesson as any).completed) return;

    const token = localStorage.getItem("access_token");
    if (!token) {
        toast.error("Sessão expirada.");
        return;
    }

    setIsSubmitting(true);

    const baseAPI = process.env.NEXT_PUBLIC_API_BASE_URL;
    const API_URL = `${baseAPI}progress/complete-lesson`;

    // DTO enviado ao backend
    const lessonCompleteDTO = {
        lessonId: Number(activeLesson.id),
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(lessonCompleteDTO),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
                errorData.message || "Falha ao marcar a aula como concluída."
            );
        }

        toast.success("Aula marcada como concluída! 🎉");

        // Recarrega o curso para atualizar progresso e status da aula
        await fetchCourse();
    } catch (error: any) {
        console.error("Erro ao completar a aula:", error);
        toast.error(error.message || "Erro de conexão ao completar a aula.");
    } finally {
        setIsSubmitting(false);
    }
};


    // Chama o fetch inicial na montagem
    useEffect(() => {
        fetchCourse();
    }, [fetchCourse]);


    // ===============================
    // Player de Vídeo (sem mudanças)
    // ===============================
    const renderVideoPlayer = (lesson: Lesson) => {
        const videoSrc = lesson.video_url || "";

        // 1. YouTube
        const youtubeRegex =
            /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;

        const ytMatch = videoSrc.match(youtubeRegex);

        if (ytMatch?.[1]) {
            const videoId = ytMatch[1];
            return (
                <iframe
                    className="w-full h-full border-0"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
            );
        }

        // 2. Arquivo local do backend
        if (videoSrc.trim() !== "") {
            const backendBase = process.env.NEXT_PUBLIC_API_BASE_URL;
            const fileName = videoSrc.split("/").pop();

            if (fileName?.includes(".")) {
                return (
                    <video
                        className="w-full h-full bg-black"
                        controls
                        crossOrigin="anonymous"
                    >
                        <source
                            src={`${backendBase}videos/${fileName}`}
                            type="video/mp4"
                        />
                        Seu navegador não suporta vídeos MP4.
                    </video>
                );
            }
        }

        return (
            <div className="text-white text-center p-10">
                <p>Vídeo não disponível.</p>
                <small className="text-gray-400">{videoSrc}</small>
            </div>
        );
    };

    if (loading)
        return (
            <div className="p-10 text-center animate-pulse">
                Carregando conteúdo...
            </div>
        );

    if (!course)
        return (
            <div className="p-10 text-center text-red-500">
                Curso não encontrado.
            </div>
        );

    // Variável de conveniência para verificar se a aula ativa está concluída
    const activeLessonCompleted = (activeLesson as any)?.completed;

    // ===============================
    // Render principal (com botão de conclusão)
    // ===============================
    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#f9fafb]">

            {/* CONTEÚDO PRINCIPAL (ESQUERDA) */}
            <main className="flex-1 p-4 lg:p-10 overflow-y-auto">
                <div className="max-w-5xl mx-auto">
                
                    {/* PLAYER */}
                    <div className="bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video border border-gray-800 flex items-center justify-center">
                        {activeLesson ? (
                            activeLesson.lesson_type === "video"
                                ? renderVideoPlayer(activeLesson)
                                : (
                                    <div className="p-10 text-white prose prose-invert max-w-full">
                                        <h2 className="text-white mb-4">{activeLesson.title}</h2>
                                        <div>{activeLesson.content}</div>
                                    </div>
                                )
                        ) : (
                            // MENSAGEM DE BOAS-VINDAS: Exibe o título do curso quando nenhuma aula está selecionada
                            <div className="text-white text-center p-10 flex flex-col items-center justify-center h-full">
                                <h2 className="text-3xl font-bold mb-4">{course.title}</h2>
                                <p className="text-gray-400 max-w-lg">
                                    Selecione uma aula na barra lateral para começar o curso.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Botão de Conclusão */}
                    {activeLesson && !activeLessonCompleted && (
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={markLessonAsCompleted}
                                disabled={isSubmitting}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-colors disabled:opacity-75 disabled:cursor-not-allowed ${
                                    isSubmitting
                                        ? "bg-blue-400"
                                        : "bg-blue-600 hover:bg-blue-700"
                                }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Marcar como Concluída
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                    
                    {/* TÍTULO E DESCRIÇÃO */}
                    <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start">
                             <h1 className="text-3xl font-extrabold text-gray-900">
                                {activeLesson?.title || course.title}
                            </h1>
                            {activeLessonCompleted && (
                                <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> Concluída
                                </span>
                            )}
                        </div>

                        <p className="text-gray-600 mt-4 text-lg">
                            {activeLesson?.content || course.description}
                        </p>
                    </div>

                    {/* QUESTÕES DA AULA */}
                    {activeLesson?.questions?.length ? (
                        <div className="mt-8">
                            <LessonQuestions
                                questions={activeLesson.questions || []}
                                lessonId={Number(activeLesson.id)}
                            />
                        </div>
                    ) : null}

                </div>
            </main>

            {/* SIDEBAR (DIREITA) - Inalterada */}
            <aside className="w-full lg:w-[400px] bg-white border-l border-gray-200 flex flex-col shadow-lg">

                {/* HEADER DO SIDEBAR (COM PROGRESSO) */}
                <div className="p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
                    <h2 className="font-bold text-xl text-gray-800">Conteúdo do Curso</h2>
                    
                    {/* Safe Count */}
                    <div className="text-sm text-gray-500 mt-1 mb-4">
                        {course.modules?.length || 0} módulos •{" "}
                        {(course.modules || []).reduce(
                            (acc, m) => acc + (m.lessons?.length || 0),
                            0
                        )}{" "}
                        aulas
                    </div>

                    {/* BARRA DE PROGRESso */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Seu Progresso</span>
                            <span className="text-sm font-bold text-blue-600">
                                {progressPercentage}%
                            </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* LISTA DE AULAS */}
                <nav className="flex-1 overflow-y-auto">
                    {(course.modules || []).map((module, mIdx) => (
                        <div key={module.id}>
                            <div className="bg-gray-50 px-6 py-3 font-bold text-[10px] text-gray-400 uppercase tracking-widest border-y border-gray-100">
                                {mIdx + 1}. {module.title}
                            </div>

                            <div>
                                {(module.lessons || []).map((lesson) => {
                                    // A propriedade 'completed' agora existe porque processamos os dados no useEffect
                                    const active = activeLesson?.id === lesson.id;
                                    const isCompleted = (lesson as any).completed;

                                    return (
                                        <button
                                            key={lesson.id}
                                            onClick={() => setActiveLesson(lesson)}
                                            className={`flex items-center gap-4 px-6 py-4 w-full text-left border-b border-gray-50 transition-all ${
                                                active
                                                    ? "bg-blue-50 border-l-4 border-blue-600"
                                                    : "hover:bg-gray-50 border-l-4 border-transparent"
                                            }`}
                                        >
                                            {/* Ícone (Vídeo ou Texto) */}
                                            <div className="relative">
                                                {lesson.lesson_type === "video" ? (
                                                    <PlayCircle
                                                        className={`w-5 h-5 ${
                                                            active ? "text-blue-600" : "text-gray-400"
                                                        }`}
                                                    />
                                                ) : (
                                                    <FileText
                                                        className={`w-5 h-5 ${
                                                            active ? "text-blue-600" : "text-gray-400"
                                                        }`}
                                                    />
                                                )}
                                            </div>

                                            {/* Título da Aula */}
                                            <div className="flex-1 truncate">
                                                <p
                                                    className={`text-sm truncate ${
                                                        active
                                                            ? "font-bold text-blue-700"
                                                            : isCompleted 
                                                                ? "text-gray-500 line-through decoration-gray-300"
                                                                : "text-gray-600"
                                                    }`}
                                                >
                                                    {lesson.title}
                                                </p>
                                            </div>

                                            {/* Ícone de Status (Check ou Seta) */}
                                            {isCompleted ? (
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                            ) : active ? (
                                                <ChevronRight className="w-4 h-4 text-blue-400" />
                                            ) : null}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>
            </aside>
        </div>
    );
};

export default WatchCourse;