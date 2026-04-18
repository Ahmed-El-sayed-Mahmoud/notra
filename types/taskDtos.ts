import type { Priority } from './index';

export interface CreateTaskDto {
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string | null;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  priority?: Priority;
  dueDate?: string | null;
  aiSuggestions?: string[];
}

export interface ToggleCompleteDto {
  completed: boolean;
}

export interface DeleteTaskDto {
  id: string;
}
