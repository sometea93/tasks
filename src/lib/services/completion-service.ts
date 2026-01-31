import type { TypedSupabaseClient } from '$lib/supabase';
import type { TaskCompletion } from '$lib/types/task-instance';
import { formatDateKey } from './recurrence-service';

export class CompletionService {
	constructor(private supabase: TypedSupabaseClient) {}

	/**
	 * Mark a recurring task instance as completed
	 */
	async completeInstance(taskId: string, instanceDate: Date, userId: string): Promise<TaskCompletion> {
		const completedDate = formatDateKey(instanceDate);

		const { data, error } = await this.supabase
			.from('task_completions')
			.insert({
				task_id: taskId,
				user_id: userId,
				completed_date: completedDate
			})
			.select()
			.single();

		if (error) {
			// Handle unique constraint violation (already completed)
			if (error.code === '23505') {
				const existing = await this.getCompletion(taskId, completedDate);
				if (existing) return existing;
			}
			throw error;
		}

		return data;
	}

	/**
	 * Unmark a recurring task instance (delete the completion record)
	 */
	async uncompleteInstance(taskId: string, instanceDate: Date): Promise<void> {
		const completedDate = formatDateKey(instanceDate);

		const { error } = await this.supabase
			.from('task_completions')
			.delete()
			.eq('task_id', taskId)
			.eq('completed_date', completedDate);

		if (error) throw error;
	}

	/**
	 * Get a specific completion record
	 */
	async getCompletion(taskId: string, completedDate: string): Promise<TaskCompletion | null> {
		const { data, error } = await this.supabase
			.from('task_completions')
			.select('*')
			.eq('task_id', taskId)
			.eq('completed_date', completedDate)
			.single();

		if (error) {
			if (error.code === 'PGRST116') return null; // Not found
			throw error;
		}

		return data;
	}

	/**
	 * Fetch all completions within a date range for the current user
	 */
	async fetchCompletionsInRange(startDate: Date, endDate: Date): Promise<TaskCompletion[]> {
		const start = formatDateKey(startDate);
		const end = formatDateKey(endDate);

		const { data, error } = await this.supabase
			.from('task_completions')
			.select('*')
			.gte('completed_date', start)
			.lte('completed_date', end)
			.order('completed_date', { ascending: true });

		if (error) throw error;
		return data;
	}

	/**
	 * Fetch all completions for a specific task
	 */
	async fetchCompletionsForTask(taskId: string): Promise<TaskCompletion[]> {
		const { data, error } = await this.supabase
			.from('task_completions')
			.select('*')
			.eq('task_id', taskId)
			.order('completed_date', { ascending: false });

		if (error) throw error;
		return data;
	}

	/**
	 * Check if a specific instance is completed
	 */
	async isInstanceCompleted(taskId: string, instanceDate: Date): Promise<boolean> {
		const completedDate = formatDateKey(instanceDate);
		const completion = await this.getCompletion(taskId, completedDate);
		return completion !== null;
	}
}
