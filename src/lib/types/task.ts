import type { Tables, TablesInsert, TablesUpdate } from './database.types';

export type Task = Tables<'tasks'>;
export type TaskInsert = TablesInsert<'tasks'>;
export type TaskUpdate = TablesUpdate<'tasks'>;

export type TaskPriority = 1 | 2 | 3;
export type TaskStatus = 'active' | 'completed';

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
	1: 'High',
	2: 'Normal',
	3: 'Low'
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
	1: 'bg-red-100 text-red-800',
	2: 'bg-blue-100 text-blue-800',
	3: 'bg-gray-100 text-gray-800'
};
