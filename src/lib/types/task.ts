import type { Tables, TablesInsert, TablesUpdate } from './database.types';

export type Task = Tables<'tasks'>;
export type TaskInsert = TablesInsert<'tasks'>;
export type TaskUpdate = TablesUpdate<'tasks'>;

export type TaskPriority = 1 | 2 | 3;
export type TaskStatus = 'active' | 'completed';

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
	1: 'High',
	2: 'Medium',
	3: 'Low'
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
	1: '#ff3b30', // Red - High
	2: '#ff9500', // Yellow/Orange - Medium
	3: '#007aff'  // Blue - Low
};
