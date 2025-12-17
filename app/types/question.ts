import { Answer } from "./answer";

export type Question = {
id: number;
question_text: string;
question_type: string;
points_value: number;
answers: Answer[];
};