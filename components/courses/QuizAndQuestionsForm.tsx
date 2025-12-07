// steps/QuizAndQuestionsForm.tsx
"use client";

import React from 'react';
import { useForm, useFieldArray, UseFormReturn, Control, UseFormRegister, UseFormWatch, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Trash2, PlusCircle, CheckCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { z } from 'zod'; 
// Se você for usar o zodResolver, descomente a linha abaixo:
// import { zodResolver } from '@hookform/resolvers/zod'; 

// =======================================================
// 1. TIPAGEM E VALIDAÇÃO ZOD (Movida para o topo)
// =======================================================

const AnswerSchema = z.object({
    answer_text: z.string().min(1, "O texto da resposta é obrigatório."),
    is_correct: z.boolean(),
});

const QuestionSchema = z.object({
    question_text: z.string().min(4, "O texto da pergunta é obrigatório."),
    points_value: z.number().min(1, "A pontuação deve ser maior que zero."),
    question_type: z.enum(['multiple_choice', 'true_false']).default('multiple_choice'),
    answers: z.array(AnswerSchema).min(2, "Uma pergunta deve ter pelo menos 2 opções de resposta."),
}).superRefine((data, ctx) => {
    // Validação condicional: Deve haver pelo menos UMA resposta correta
    const correctAnswers = data.answers.filter(a => a.is_correct);
    if (correctAnswers.length === 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Cada pergunta deve ter pelo menos uma resposta marcada como correta.",
            path: [`answers`],
        });
    }
});

const FormSchema = z.object({
    questions: z.array(QuestionSchema),
});

// 💡 AGORA ACESSÍVEL: Tipo inferido do esquema Zod
export type FormSchemaType = z.infer<typeof FormSchema>;


// =======================================================
// 2. INTERFACES (Usando o FormSchemaType)
// =======================================================

interface AnswerInputProps {
    questionIndex: number;
    answerIndex: number;
    // Tipagem correta agora que FormSchemaType está definido
    control: Control<FormSchemaType>;
    register: UseFormRegister<FormSchemaType>;
    removeAnswer: (index: number) => void;
    isCorrect: boolean; 
    answerId: string; 
}

interface AnswerFieldArrayProps {
    questionIndex: number;
    control: Control<FormSchemaType>;
    register: UseFormRegister<FormSchemaType>;
    watch: UseFormWatch<FormSchemaType>;
}


// =======================================================
// 3. SUB-COMPONENTE: AnswerInput (Resolve um único item de resposta)
// =======================================================

function AnswerInput({ 
    questionIndex, 
    answerIndex, 
    control, 
    register, 
    removeAnswer, 
    isCorrect, 
    answerId 
}: AnswerInputProps) {
    
    const textPath = `questions.${questionIndex}.answers.${answerIndex}.answer_text` as const;
    const correctPath = `questions.${questionIndex}.answers.${answerIndex}.is_correct` as const;

    return (
        <div key={answerId} className={`flex items-center space-x-2 p-2 border rounded ${isCorrect ? 'border-green-600 bg-green-100' : 'bg-white'}`}>
            
            {/* Indicador de Correção */}
            {isCorrect ? (
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            ) : (
                <div className='h-5 w-5 flex-shrink-0' />
            )}
            
            {/* Input do Texto da Resposta (usando register normal) */}
            <Input 
                {...register(textPath)}
                placeholder={`Opção ${answerIndex + 1}`}
                className="flex-grow"
                required
            />
            
            {/* CORREÇÃO PRINCIPAL: Usando o Controller para o Switch */}
            <div className="flex items-center space-x-2">
                <Label htmlFor={`correct-switch-${answerId}`} className="text-sm">Correta?</Label>
                
                <Controller
                    name={correctPath}
                    control={control}
                    render={({ field }) => (
                        <Switch
                            id={`correct-switch-${answerId}`}
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                            onBlur={field.onBlur}
                            ref={field.ref}
                        />
                    )}
                />
            </div>

            {/* Botão de Remover Opção */}
            <Button type="button" variant="ghost" size="icon" onClick={() => removeAnswer(answerIndex)}>
                <Trash2 className="h-4 w-4 text-red-400" />
            </Button>
        </div>
    );
}

// =======================================================
// 4. SUB-COMPONENTE: AnswerFieldArray (Resolve o array de respostas)
// =======================================================

function AnswerFieldArray({ questionIndex, control, register, watch }: AnswerFieldArrayProps) {
    const { fields: answerFields, append: appendAnswer, remove: removeAnswer } = useFieldArray({
        control,
        name: `questions.${questionIndex}.answers` as 'questions.0.answers' 
    });

    const currentAnswers = watch(`questions.${questionIndex}.answers`);
    
    return (
        <div className="space-y-3 p-3 border rounded-md bg-green-50">
            <h4 className="font-semibold text-sm">Opções de Resposta</h4>
            {answerFields.map((answer: any, answerIndex: number) => {
                
                return (
                    <AnswerInput
                        key={answer.id}
                        answerId={answer.id} 
                        questionIndex={questionIndex}
                        answerIndex={answerIndex}
                        control={control}
                        register={register}
                        removeAnswer={removeAnswer}
                        isCorrect={currentAnswers?.[answerIndex]?.is_correct ?? false} 
                    />
                );
            })}
            
            <Button type="button" variant="secondary" size="sm" onClick={() => appendAnswer({ answer_text: "", is_correct: false })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Opção
            </Button>
        </div>
    );
}


// =======================================================
// 5. COMPONENTE PRINCIPAL: QuizAndQuestionsForm
// =======================================================

export default function QuizAndQuestionsForm({ initialData, onNext }: { initialData: any, onNext: (data: any) => void }) {
    
    const defaultInitialData: FormSchemaType = { 
        questions: [{ 
            question_text: "", 
            points_value: 10, 
            question_type: 'multiple_choice', 
            answers: [
                { answer_text: "Opção A", is_correct: true },
                { answer_text: "Opção B", is_correct: false }
            ] 
        }] 
    };
    
    const { 
        register, 
        control, 
        handleSubmit, 
        watch, 
        formState: { errors } 
    } = useForm<FormSchemaType>({
        // Adicione o resolver se quiser validação Zod
        // resolver: zodResolver(FormSchema), 
        defaultValues: {
            // Se initialData for um array, use-o; senão, use o padrão
            questions: initialData && Array.isArray(initialData) && initialData.length > 0 ? initialData : defaultInitialData.questions
        }
    });

    const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
        control,
        name: "questions"
    });

    const onSubmit = (data: FormSchemaType) => {
        // Envia apenas o array de perguntas
        onNext(data.questions);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Quizzes e Perguntas (Gamificação) 🏅</h2>
            
            {errors.questions && <p className="text-red-500 text-sm">🚨 {errors.questions.message || "Por favor, corrija os erros nas perguntas."}</p>}

            {questionFields.map((question, questionIndex) => (
                <Card key={question.id} className="mb-6 border-l-4 border-green-500">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Pergunta #{questionIndex + 1}</CardTitle>
                        <Button type="button" variant="ghost" onClick={() => removeQuestion(questionIndex)} size="sm">
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                        {/* Texto da Pergunta */}
                        <Textarea 
                            {...register(`questions.${questionIndex}.question_text`)} 
                            placeholder="Texto da Pergunta" 
                            rows={2}
                            required
                        />
                        {errors.questions?.[questionIndex]?.question_text && (
                            <p className="text-red-500 text-sm">{errors.questions[questionIndex].question_text.message}</p>
                        )}
                        
                        <div className="flex space-x-4">
                            {/* Pontuação */}
                            <Input 
                                type="number"
                                {...register(`questions.${questionIndex}.points_value`, { valueAsNumber: true })} 
                                placeholder="Pontos"
                                min={1}
                                required
                            />
                            {errors.questions?.[questionIndex]?.points_value && (
                                <p className="text-red-500 text-sm">{errors.questions[questionIndex].points_value.message}</p>
                            )}
                            
                            <input type="hidden" {...register(`questions.${questionIndex}.question_type`)} />
                        </div>

                        {/* Sub-componente para as OPÇÕES DE RESPOSTA */}
                        <AnswerFieldArray 
                            questionIndex={questionIndex} 
                            control={control} 
                            register={register} 
                            watch={watch} 
                        />
                        
                        {errors.questions?.[questionIndex]?.answers && (
                            <p className="text-red-500 text-sm">🚨 {errors.questions[questionIndex].answers.message}</p>
                        )}

                    </CardContent>
                </Card>
            ))}

            <Button type="button" onClick={() => appendQuestion({ 
                question_text: "", 
                points_value: 10, 
                question_type: 'multiple_choice', 
                answers: [
                    { answer_text: "Opção A", is_correct: false },
                    { answer_text: "Opção B", is_correct: false }
                ] 
            })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Nova Pergunta
            </Button>

            <div className="pt-6">
                <Button type="submit" className="w-full">
                    Salvar Quizzes e Ir para Revisão
                </Button>
            </div>
        </form>
    );
}