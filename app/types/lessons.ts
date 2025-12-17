import { Question } from "./question";

export type Lesson = {
  id: string;
  title: string;
  lesson_type: string; 
  video_url: string; 
  content: string;
  order_index: number;
  is_active: boolean;
  completed: boolean;
  questions?: Question[];
};