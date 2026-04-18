import { create } from 'zustand';
import { Task, TaskFilter } from '@/types';
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleComplete as apiToggleComplete,
} from '@/lib/tasksApi';
import type { CreateTaskDto, UpdateTaskDto } from '@/types/taskDtos';

interface TaskState {
  tasks: Task[];
  filter: TaskFilter;
  isLoading: boolean;
  error: string | null;

  hydrate: () => Promise<void>;
  addTask: (dto: CreateTaskDto) => Promise<void>;
  updateTask: (id: string, dto: UpdateTaskDto) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  setFilter: (filter: TaskFilter) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

const isToday = (dateStr: string | null): boolean => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
};

const isOverdue = (dateStr: string | null, completed: boolean): boolean => {
  if (!dateStr || completed) return false;
  return new Date(dateStr) < new Date(new Date().setHours(0, 0, 0, 0));
};

export const useTaskStore = create<TaskState>()((set, get) => ({
  tasks: [],
  filter: 'all',
  isLoading: false,
  error: null,

  hydrate: async () => {
    set({ isLoading: true, error: null });
    try {
      const tasks = await fetchTasks();
      set({ tasks, isLoading: false });
    } catch (e) {
      set({ isLoading: false, error: (e as Error).message });
    }
  },

  addTask: async (dto) => {
    set({ error: null });
    try {
      const task = await createTask(dto);
      set((s) => ({ tasks: [task, ...s.tasks] }));
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  updateTask: async (id, dto) => {
    const previous = get().tasks;
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...dto } : t)),
      error: null,
    }));
    try {
      const updated = await updateTask(id, dto);
      set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? updated : t)) }));
    } catch (e) {
      set({ tasks: previous, error: (e as Error).message });
    }
  },

  deleteTask: async (id) => {
    const previous = get().tasks;
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id), error: null }));
    try {
      await deleteTask(id);
    } catch (e) {
      set({ tasks: previous, error: (e as Error).message });
    }
  },

  toggleComplete: async (id) => {
    const previous = get().tasks;
    const task = previous.find((t) => t.id === id);
    if (!task) return;

    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
      error: null,
    }));

    try {
      const updated = await apiToggleComplete(id, { completed: !task.completed });
      set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? updated : t)) }));
    } catch (e) {
      set({ tasks: previous, error: (e as Error).message });
    }
  },

  setFilter: (filter) => set({ filter }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

export const getFilteredTasks = (tasks: Task[], filter: TaskFilter): Task[] => {
  switch (filter) {
    case 'active':    return tasks.filter((t) => !t.completed);
    case 'completed': return tasks.filter((t) => t.completed);
    case 'today':     return tasks.filter((t) => isToday(t.dueDate));
    case 'overdue':   return tasks.filter((t) => isOverdue(t.dueDate, t.completed));
    default:          return tasks;
  }
};

export const getTodayTasks  = (tasks: Task[]): Task[] => tasks.filter((t) => isToday(t.dueDate));
export const getOverdueTasks = (tasks: Task[]): Task[] => tasks.filter((t) => isOverdue(t.dueDate, t.completed));
