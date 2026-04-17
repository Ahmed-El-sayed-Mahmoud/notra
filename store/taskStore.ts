import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, TaskFilter, AISuggestion } from '@/types';

interface TaskState {
  tasks: Task[];
  filter: TaskFilter;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'aiSuggestions'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleComplete: (id: string) => void;
  setFilter: (filter: TaskFilter) => void;
  addAISuggestion: (taskId: string, suggestion: Omit<AISuggestion, 'id' | 'createdAt'>) => void;
}

const isToday = (dateStr: string | null): boolean => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

const isOverdue = (dateStr: string | null, completed: boolean): boolean => {
  if (!dateStr || completed) return false;
  return new Date(dateStr) < new Date(new Date().setHours(0, 0, 0, 0));
};

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      filter: 'all',

      addTask: (taskData) => {
        const task: Task = {
          ...taskData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          aiSuggestions: [],
        };
        set((state) => ({ tasks: [...state.tasks, task] }));
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));
      },

      deleteTask: (id) => {
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
      },

      toggleComplete: (id) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t
          ),
        }));
      },

      setFilter: (filter) => set({ filter }),

      addAISuggestion: (taskId, suggestion) => {
        const newSuggestion: AISuggestion = {
          ...suggestion,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? { ...t, aiSuggestions: [...t.aiSuggestions, newSuggestion] }
              : t
          ),
        }));
      },
    }),
    {
      name: 'notra-tasks',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const getFilteredTasks = (tasks: Task[], filter: TaskFilter): Task[] => {
  switch (filter) {
    case 'active':
      return tasks.filter((t) => !t.completed);
    case 'completed':
      return tasks.filter((t) => t.completed);
    case 'today':
      return tasks.filter((t) => isToday(t.dueDate));
    case 'overdue':
      return tasks.filter((t) => isOverdue(t.dueDate, t.completed));
    default:
      return tasks;
  }
};

export const getTodayTasks = (tasks: Task[]): Task[] =>
  tasks.filter((t) => isToday(t.dueDate));

export const getOverdueTasks = (tasks: Task[]): Task[] =>
  tasks.filter((t) => isOverdue(t.dueDate, t.completed));
