"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  CheckCircle, 
  PlayCircle, 
  FileText, 
  HelpCircle, 
  Menu, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ====================== TYPES (Baseado no seu JSON) ======================
type LessonType = 'video' | 'text' | 'quiz';

interface Lesson {
  id: number;
  module_id: number;
  title: string;
  lesson_type: LessonType;
  video_url: string | null;
  content: string; // No seu JSON, o link do youtube veio aqui
  order_index: number;
  is_active: boolean;
}

interface Module {
  id: number;
  title: string;
  lessons: Lesson[];
}

interface Course {
  id: number;
  title: string;
  modules: Module[];
  points_awarded: number;
}

// ====================== HELPER: Extrair ID do YouTube ======================
function getYouTubeId(url: string | null) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// ====================== COMPONENTE PRINCIPAL ======================
export default function CoursePlayerPage() {
  // Simulação dos dados vindos da API (seu JSON)
  const course: Course = {
    id: 1,
    title: "The Best React Course",
    points_awarded: 150,
    modules: [
      {
        id: 1,
        title: "Módulo 1: Introdução",
        lessons: [
          {
            id: 1,
            module_id: 1,
            title: "Bem-vindo ao Curso",
            lesson_type: "video",
            video_url: null,
            content: "https://youtu.be/QrObWvRfn-o?si=qS6aWrsScTCZPq0G",
            order_index: 0,
            is_active: true
          },
          {
            id: 2,
            module_id: 1,
            title: "Material de Apoio",
            lesson_type: "text",
            video_url: null,
            content: "Aqui está o conteúdo escrito da aula...",
            order_index: 1,
            is_active: true
          }
        ]
      },
      {
        id: 2,
        title: "Módulo 2: Avançando",
        lessons: [
          {
            id: 3,
            module_id: 2,
            title: "Quiz de Conhecimentos",
            lesson_type: "quiz",
            video_url: null,
            content: "{}",
            order_index: 0,
            is_active: true
          }
        ]
      }
    ]
  };

  // ESTADOS
  const [activeLessonId, setActiveLessonId] = useState<number>(course.modules[0].lessons[0].id);
  // Simula aulas concluídas (num cenário real viria do backend)
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // COMPUTADOS
  const activeLesson = useMemo(() => {
    for (const mod of course.modules) {
      const lesson = mod.lessons.find(l => l.id === activeLessonId);
      if (lesson) return lesson;
    }
    return course.modules[0].lessons[0];
  }, [activeLessonId, course.modules]);

  const totalLessons = course.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
  const progressPercentage = Math.round((completedLessons.length / totalLessons) * 100);

  // NAVEGAÇÃO
  const flattenLessons = useMemo(() => {
    return course.modules.flatMap(m => m.lessons);
  }, [course.modules]);

  const handleNext = () => {
    const currentIndex = flattenLessons.findIndex(l => l.id === activeLessonId);
    if (currentIndex < flattenLessons.length - 1) {
      setActiveLessonId(flattenLessons[currentIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    const currentIndex = flattenLessons.findIndex(l => l.id === activeLessonId);
    if (currentIndex > 0) {
      setActiveLessonId(flattenLessons[currentIndex - 1].id);
    }
  };

  const toggleComplete = (lessonId: number) => {
    setCompletedLessons(prev => 
      prev.includes(lessonId) 
        ? prev.filter(id => id !== lessonId) 
        : [...prev, lessonId]
    );
  };

  // RENDERIZADORES DE CONTEÚDO
  const renderContent = () => {
    if (activeLesson.lesson_type === 'video') {
      // Tenta pegar do video_url, se não existir, tenta do content (conforme seu JSON)
      const urlToParse = activeLesson.video_url || activeLesson.content;
      const videoId = getYouTubeId(urlToParse);

      return (
        <div className="aspect-video w-full bg-black rounded-lg overflow-hidden shadow-lg">
          {videoId ? (
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videoId}`}
              title={activeLesson.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="border-0"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-white">
              Vídeo indisponível
            </div>
          )}
        </div>
      );
    }

    if (activeLesson.lesson_type === 'text') {
      return (
        <Card>
          <CardContent className="p-6 prose max-w-none dark:prose-invert">
            <h3>Conteúdo da Aula</h3>
            <p>{activeLesson.content}</p>
          </CardContent>
        </Card>
      );
    }

    if (activeLesson.lesson_type === 'quiz') {
      return (
        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
          <CardContent className="p-8 text-center space-y-4">
            <HelpCircle className="w-12 h-12 mx-auto text-blue-500" />
            <h2 className="text-2xl font-bold">Hora do Quiz!</h2>
            <p className="text-muted-foreground">Teste seus conhecimentos sobre este módulo.</p>
            <Button size="lg" className="mt-4">Iniciar Quiz</Button>
          </CardContent>
        </Card>
      );
    }
  };

  // SUB-COMPONENTE SIDEBAR (Reutilizável para Mobile e Desktop)
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h1 className="font-bold text-lg leading-tight">{course.title}</h1>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{progressPercentage}% concluído</span>
            <span>{completedLessons.length}/{totalLessons} aulas</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <Accordion type="multiple" defaultValue={course.modules.map(m => `item-${m.id}`)} className="w-full">
          {course.modules.map((module) => (
            <AccordionItem key={module.id} value={`item-${module.id}`}>
              <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/50 py-3 text-sm font-semibold">
                {module.title}
              </AccordionTrigger>
              <AccordionContent className="pt-0 pb-0">
                <div className="flex flex-col">
                  {module.lessons.map((lesson) => {
                    const isActive = activeLessonId === lesson.id;
                    const isCompleted = completedLessons.includes(lesson.id);
                    
                    // Ícone baseado no tipo
                    let Icon = PlayCircle;
                    if (lesson.lesson_type === 'text') Icon = FileText;
                    if (lesson.lesson_type === 'quiz') Icon = HelpCircle;

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => {
                           setActiveLessonId(lesson.id);
                           setIsSidebarOpen(false); // Fecha sidebar no mobile ao clicar
                        }}
                        className={`flex items-center gap-x-2 text-sm font-medium pl-4 pr-3 py-3 hover:text-slate-600 hover:bg-slate-300/20 transition-all text-left
                          ${isActive ? "text-slate-700 bg-slate-200/20 border-r-4 border-slate-700" : "text-slate-500"}
                        `}
                      >
                        <div className="flex items-center gap-x-2 w-full">
                           {isCompleted ? (
                             <CheckCircle className="text-emerald-500 h-4 w-4 shrink-0" />
                           ) : (
                             <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-slate-700" : "text-slate-500"}`} />
                           )}
                           <span className="line-clamp-1">{lesson.title}</span>
                        </div>
                        {isCompleted && (
                            <Badge variant="outline" className="ml-auto text-[10px] text-emerald-600 border-emerald-200 bg-emerald-50">OK</Badge>
                        )}
                      </button>
                    )
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>
    </div>
  );

  return (
    <div className="h-screen flex flex-col">
      {/* HEADER MOBILE */}
      <div className="h-[80px] md:hidden flex items-center p-4 border-b bg-white z-50">
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-4">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80">
            <SidebarContent />
          </SheetContent>
        </Sheet>
        <span className="font-bold truncate">{activeLesson.title}</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR DESKTOP */}
        <div className="hidden md:flex h-full w-80 flex-col border-r bg-white overflow-y-auto">
          <SidebarContent />
        </div>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8 flex flex-col">
          
          <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col gap-6">
            
            {/* Player / Conteúdo */}
            {renderContent()}

            {/* Info e Controles */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-10">
              <div>
                <h2 className="text-2xl font-bold mb-1">{activeLesson.title}</h2>
                <div className="text-sm text-muted-foreground">
                  {/* Se houver descrição, coloque aqui */}
                  Pontos ao concluir: <span className="font-semibold text-amber-600">+{course.points_awarded / totalLessons} xp</span>
                </div>
              </div>

              <Button 
                onClick={() => toggleComplete(activeLessonId)}
                variant={completedLessons.includes(activeLessonId) ? "outline" : "default"}
                className={`w-full md:w-auto ${completedLessons.includes(activeLessonId) ? "text-emerald-600 border-emerald-200 hover:text-emerald-700 hover:border-emerald-300" : "bg-emerald-600 hover:bg-emerald-700"}`}
              >
                {completedLessons.includes(activeLessonId) ? (
                    <>
                        <CheckCircle className="h-4 w-4 mr-2" /> Concluída
                    </>
                ) : (
                    "Marcar como Concluída"
                )}
              </Button>
            </div>

            <Separator />

            {/* Navegação Prev/Next */}
            <div className="flex justify-between items-center pt-4">
                <Button 
                    variant="ghost" 
                    onClick={handlePrevious}
                    disabled={flattenLessons[0].id === activeLessonId}
                >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
                </Button>

                <Button 
                    variant="ghost" 
                    onClick={handleNext}
                    disabled={flattenLessons[flattenLessons.length - 1].id === activeLessonId}
                >
                    Próximo <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}