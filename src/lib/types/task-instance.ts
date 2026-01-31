import type { TaskPriority } from './task';

export interface TaskInstance {
	id: string; // taskId or taskId_YYYY-MM-DD for recurring instances
	parentTaskId: string;
	title: string;
	priority: TaskPriority;
	instanceDate: Date;
	isRecurring: boolean;
	recurrenceRule: string | null;
	isCompleted: boolean;
}

export interface TaskCompletion {
	id: string;
	task_id: string;
	user_id: string;
	completed_date: string; // YYYY-MM-DD
	completed_at: string;
}

export interface TaskCompletionInsert {
	task_id: string;
	user_id: string;
	completed_date: string;
}
