import { Lesson } from "./lessons";

export type Module = {
  id: string;
  course_id: string;
  title: string; 
  order_index: number;
  is_active: boolean;
    lessons: Lesson[];
};