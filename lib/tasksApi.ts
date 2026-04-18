import { supabase } from './supabase';
import type { Task, Priority } from '../types';
import type { CreateTaskDto, UpdateTaskDto, ToggleCompleteDto } from '../types/taskDtos';

type Row = {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  due_date: string | null;
  completed: boolean;
  created_at: string;
  ai_suggestions: string[];
};

function rowToTask(row: Row): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    priority: row.priority as Priority,
    dueDate: row.due_date,
    completed: row.completed,
    createdAt: row.created_at,
    aiSuggestions: row.ai_suggestions.map((text, i) => ({
      id: `${row.id}-${i}`,
      text,
      type: 'planning' as const,
      createdAt: row.created_at,
    })),
  };
}

export async function fetchTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as Row[]).map(rowToTask);
}

export async function createTask(dto: CreateTaskDto): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title: dto.title,
      description: dto.description ?? null,
      priority: dto.priority,
      due_date: dto.dueDate ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return rowToTask(data as Row);
}

export async function updateTask(id: string, dto: UpdateTaskDto): Promise<Task> {
  const payload: Record<string, unknown> = {};
  if (dto.title !== undefined) payload.title = dto.title;
  if (dto.description !== undefined) payload.description = dto.description ?? null;
  if (dto.priority !== undefined) payload.priority = dto.priority;
  if (dto.dueDate !== undefined) payload.due_date = dto.dueDate;
  if (dto.aiSuggestions !== undefined) payload.ai_suggestions = dto.aiSuggestions;

  const { data, error } = await supabase
    .from('tasks')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return rowToTask(data as Row);
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
}

export async function toggleComplete(id: string, dto: ToggleCompleteDto): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update({ completed: dto.completed })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return rowToTask(data as Row);
}
