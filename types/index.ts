export type Priority = 'low' | 'medium' | 'high';

export * from './taskDtos';

export type TaskFilter = 'all' | 'active' | 'completed' | 'today' | 'overdue';

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AISuggestion {
  id: string;
  text: string;
  type: 'priority' | 'breakdown' | 'planning';
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
  aiSuggestions: AISuggestion[];
}
