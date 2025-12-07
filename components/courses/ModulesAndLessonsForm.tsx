import { 
  useForm, 
  useFieldArray, 
  FormProvider, // Importar FormProvider
  useFormContext, // Importar useFormContext
  useWatch, // Importar useWatch para reatividade
  FieldArrayWithId // Importar para tipagem precisa
} from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Trash2, PlusCircle, Lock, Unlock } from 'lucide-react'; // Adicionado Lock/Unlock
import { Checkbox } from '@/components/ui/checkbox'; // Assumindo que você tem um componente Checkbox

// Defina o tipo correto para a lição
type Lesson = { 
  title: string; 
  lesson_type: 'video' | 'text' | 'quiz'; 
  content: string; 
  is_free_preview: boolean;
  video_url?: string; 
};

// Defina o tipo para o módulo, que possui uma lista de aulas
type Module = { 
  title: string; 
  lessons: Lesson[]; 
};

// A tipagem final do formulário
type FormSchema = { 
  modules: Module[]; 
};

// =========================================================
// COMPONENTE PAI: ModulesAndLessonsForm
// =========================================================

export default function ModulesAndLessonsForm({ initialData, onNext }: { initialData: any, onNext: (data: any) => void }) {
  // 1. Mudar de desestruturação para 'methods'
  const methods = useForm<FormSchema>({
    defaultValues: { 
      // Garantir que a estrutura inicial sempre tenha 'lessons' como array
      modules: initialData.length > 0 
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
    onNext(data.modules);
  };

  return (
    // 2. Usar FormProvider para que useFormContext funcione nos componentes aninhados
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <h2 className="text-xl font-semibold mb-4">Estrutura do Curso (Módulos e Aulas)</h2>

        {moduleFields.map((module, moduleIndex) => (
          <Card key={module.id} className="mb-6 border-l-4 border-blue-500">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Módulo #{moduleIndex + 1}</CardTitle>
              <Button type="button" variant="ghost" onClick={() => removeModule(moduleIndex)} size="sm">
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input 
                {...methods.register(`modules.${moduleIndex}.title`)} // Usar methods.register
                placeholder="Título do Módulo" 
                className="font-bold"
              />
              
              {/* 💡 Chamar o sub-componente APENAS com o índice */}
              <LessonFieldArray moduleIndex={moduleIndex} />
            </CardContent>
          </Card>
        ))}

        <Button type="button" onClick={() => appendModule({ title: `Módulo ${moduleFields.length + 1}`, lessons: [] })}>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo Módulo
        </Button>

        <div className="pt-6">
          <Button type="submit" className="w-full">
            Salvar Estrutura e Ir para Quizzes
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

// =========================================================
// SUB-COMPONENTE: LessonFieldArray
// =========================================================

// Usamos useFormContext para acessar o control e register do pai
function LessonFieldArray({ moduleIndex }: { moduleIndex: number }) {
  // 1. Obter métodos do contexto do formulário
  const { control, register } = useFormContext<FormSchema>();

  // 2. useFieldArray
  const { fields: lessonFields, append: appendLesson, remove: removeLesson } = useFieldArray({
    control,
    // Tipagem segura: 'as const'
    name: `modules.${moduleIndex}.lessons` as const 
  });

  return (
    <div className="space-y-3 p-3 border rounded-md bg-gray-50">
      <h4 className="font-semibold text-sm">Aulas do Módulo</h4>
      
      {/* 3. Mapear o fields. Usamos 'field' em vez de 'lesson' para evitar confusão de tipo, 
             pois o tipo real é FieldArrayWithId. */}
      {lessonFields.map((field, lessonIndex) => (
        <LessonItem 
            key={field.id}
            field={field}
            moduleIndex={moduleIndex} 
            lessonIndex={lessonIndex} 
            removeLesson={removeLesson} 
        />
      ))}

      <Button 
        type="button" 
        variant="secondary" 
        size="sm" 
        onClick={() => appendLesson({ 
            title: "", 
            lesson_type: 'video', 
            content: "", 
            is_free_preview: false, 
            video_url: "" // Garantir que video_url seja incluído no append
        })}
      >
        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Aula
      </Button>
    </div>
  );
}

// =========================================================
// SUB-COMPONENTE: LessonItem (Para isolar useWatch)
// =========================================================

type LessonItemProps = {
    field: FieldArrayWithId<FormSchema, `modules.${number}.lessons`, "id">;
    moduleIndex: number;
    lessonIndex: number;
    removeLesson: (index: number) => void;
}

function LessonItem({ field, moduleIndex, lessonIndex, removeLesson }: LessonItemProps) {
    const { control, register, setValue } = useFormContext<FormSchema>();

    // 1. Usar useWatch para obter o lesson_type (Isso resolve o erro)
    const lessonType = useWatch({
        control,
        name: `modules.${moduleIndex}.lessons.${lessonIndex}.lesson_type` as const,
        defaultValue: field.lesson_type
    });

    // 2. Usar useWatch para obter o estado do checkbox
    const isFreePreview = useWatch({
        control,
        name: `modules.${moduleIndex}.lessons.${lessonIndex}.is_free_preview` as const,
        defaultValue: field.is_free_preview
    });

    return (
        <div className="flex space-x-2 p-2 border rounded bg-white items-start">
            <div className="flex-grow space-y-2">
                <Input 
                    {...register(`modules.${moduleIndex}.lessons.${lessonIndex}.title`)}
                    placeholder={`Aula ${lessonIndex + 1} - Título`}
                />
                
                {/* Selecione o tipo da lição */}
                <select 
                    {...register(`modules.${moduleIndex}.lessons.${lessonIndex}.lesson_type`)}
                    className="w-full border rounded-md p-2 text-sm"
                >
                    <option value="video">Vídeo</option>
                    <option value="text">Texto</option>
                    <option value="quiz">Quiz</option>
                </select>

                {/* Renderização Condicional do Conteúdo / URL */}
                {lessonType === 'text' && (
                    <Textarea 
                        {...register(`modules.${moduleIndex}.lessons.${lessonIndex}.content`)}
                        placeholder="Conteúdo em Texto"
                        rows={3}
                    />
                )}
                
                {lessonType === 'video' && (
                    <>
                        <Input 
                            {...register(`modules.${moduleIndex}.lessons.${lessonIndex}.video_url`)}
                            placeholder="URL do vídeo (YouTube, Vimeo, etc.)"
                        />
                        <Textarea 
                            {...register(`modules.${moduleIndex}.lessons.${lessonIndex}.content`)}
                            placeholder="Breve descrição do vídeo (opcional)"
                            rows={1}
                        />
                    </>
                )}
                
                {/* Checkbox para Preview Gratuito */}
                <div className="flex items-center space-x-2 pt-1">
                    <Checkbox
                        id={`free-preview-${field.id}`}
                        checked={isFreePreview}
                        onCheckedChange={(checked) => {
                            setValue(`modules.${moduleIndex}.lessons.${lessonIndex}.is_free_preview`, !!checked);
                        }}
                    />
                    <label htmlFor={`free-preview-${field.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center">
                        {isFreePreview ? <Unlock className="h-4 w-4 mr-1 text-green-600" /> : <Lock className="h-4 w-4 mr-1 text-red-600" />}
                        Preview Gratuito
                    </label>
                </div>

            </div>

            <Button type="button" variant="outline" size="icon" onClick={() => removeLesson(lessonIndex)}>
                <Trash2 className="h-4 w-4 text-red-400" />
            </Button>
        </div>
    );
}