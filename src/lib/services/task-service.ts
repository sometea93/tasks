import type { TypedSupabaseClient } from '$lib/supabase';
import type { Task, TaskInsert, TaskUpdate } from '$lib/types/task';

export class TaskService {
	constructor(private supabase: TypedSupabaseClient) {}

	async fetchActiveTasks(): Promise<Task[]> {
		const { data, error } = await this.supabase
			.from('tasks')
			.select('*')
			.eq('status', 'active')
			.order('priority', { ascending: true })
			.order('due_date', { ascending: true, nullsFirst: false })
			.order('created_at', { ascending: false });

		if (error) throw error;
		return data;
	}

	async createTask(task: Omit<TaskInsert, 'user_id'>, userId: string): Promise<Task> {
		const { data, error } = await this.supabase
			.from('tasks')
			.insert({ ...task, user_id: userId })
			.select()
			.single();

		if (error) throw error;
		return data;
	}

	async updateTask(id: string, updates: TaskUpdate): Promise<Task> {
		const { data, error } = await this.supabase
			.from('tasks')
			.update(updates)
			.eq('id', id)
			.select()
			.single();

		if (error) throw error;
		return data;
	}

	async completeTask(id: string): Promise<Task> {
		return this.updateTask(id, { status: 'completed' });
	}

	async deleteTask(id: string): Promise<void> {
		const { error } = await this.supabase.from('tasks').delete().eq('id', id);

		if (error) throw error;
	}
}
