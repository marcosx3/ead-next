"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Question } from "@/app/types/question";

import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

import { ChevronRight } from "lucide-react";

interface LessonQuestionsProps {
  questions: Question[];
  lessonId: number;
}

export default function LessonQuestions({
  questions,
  lessonId,
}: LessonQuestionsProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelect = (questionId: number, answerId: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }));
  };

  const handleSubmit = async () => {
    let points = 0;

    questions.forEach((q) => {
      const chosen = answers[q.id];
      const correct = q.answers.find((a) => a.is_correct);

      if (chosen === correct?.id) {
        points += q.points_value;
      }
    });

    setScore(points);
    setSubmitted(true);

    try {
      const baseAPI = process.env.NEXT_PUBLIC_API_BASE_URL;

      const response = await fetch(`${baseAPI}progress/point`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          total_points: points,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro: ${response.status}`);
      }

      toast.success(`Você ganhou ${points} pontos!`);
    } catch {
      toast.error("Erro ao enviar pontuação");
    }
  };

  return (
    <div className="mt-10 bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-lg">
          <span className="font-bold text-lg text-gray-800">
            Atividade da Aula
          </span>
          <ChevronRight className="w-5 h-5 transition-transform group-data-[state=open]:rotate-90" />
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-4">
          {questions.map((q) => (
            <div key={q.id} className="mb-6">
              <p className="font-semibold text-gray-800 mb-2">
                {q.question_text}
              </p>

              <div className="flex flex-col gap-2">
                {q.answers.map((a) => {
                  const isSelected = answers[q.id] === a.id;

                  return (
                    <button
                      key={a.id}
                      onClick={() => handleSelect(q.id, a.id)}
                      disabled={submitted}
                      className={`p-3 rounded-lg border text-left transition
                        ${
                          isSelected
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-300 hover:bg-gray-50"
                        }
                      `}
                    >
                      {a.answer_text}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {!submitted ? (
            <button
              onClick={handleSubmit}
              className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
            >
              Enviar respostas
            </button>
          ) : (
            <p className="mt-4 font-bold text-green-600">
              Pontuação total: {score}
            </p>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
