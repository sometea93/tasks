import type { RealtimeChannel } from '@supabase/supabase-js';
import type { TypedSupabaseClient } from '$lib/supabase';
import type { Task } from '$lib/types/task';
import type { TaskCompletion } from '$lib/types/task-instance';
import { tasksStore } from '$lib/stores/tasks';
import { completionsStore } from '$lib/stores/completions';

type TaskPayload = {
	eventType: 'INSERT' | 'UPDATE' | 'DELETE';
	new: Task;
	old: { id: string };
};

type CompletionPayload = {
	eventType: 'INSERT' | 'UPDATE' | 'DELETE';
	new: TaskCompletion;
	old: { id: string; task_id: string; completed_date: string };
};

export class RealtimeManager {
	private tasksChannel: RealtimeChannel | null = null;
	private completionsChannel: RealtimeChannel | null = null;

	constructor(
		private supabase: TypedSupabaseClient,
		private userId: string
	) {}

	subscribe(): void {
		this.subscribeTasks();
		this.subscribeCompletions();
	}

	private subscribeTasks(): void {
		if (this.tasksChannel) {
			this.supabase.removeChannel(this.tasksChannel);
		}

		this.tasksChannel = this.supabase
			.channel(`tasks:${this.userId}`)
			.on<Task>(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'tasks',
					filter: `user_id=eq.${this.userId}`
				},
				(payload) => this.handleTaskChange(payload as unknown as TaskPayload)
			)
			.subscribe();
	}

	private subscribeCompletions(): void {
		if (this.completionsChannel) {
			this.supabase.removeChannel(this.completionsChannel);
		}

		this.completionsChannel = this.supabase
			.channel(`completions:${this.userId}`)
			.on<TaskCompletion>(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'task_completions',
					filter: `user_id=eq.${this.userId}`
				},
				(payload) => this.handleCompletionChange(payload as unknown as CompletionPayload)
			)
			.subscribe();
	}

	private handleTaskChange(payload: TaskPayload): void {
		const { eventType, new: newRecord, old: oldRecord } = payload;

		switch (eventType) {
			case 'INSERT':
				tasksStore.addTask(newRecord);
				break;
			case 'UPDATE':
				if (newRecord.status === 'completed') {
					// Remove from visible list when completed
					tasksStore.removeTask(newRecord.id);
				} else {
					tasksStore.updateTask(newRecord.id, newRecord);
				}
				break;
			case 'DELETE':
				tasksStore.removeTask(oldRecord.id);
				break;
		}
	}

	private handleCompletionChange(payload: CompletionPayload): void {
		const { eventType, new: newRecord, old: oldRecord } = payload;

		switch (eventType) {
			case 'INSERT':
				completionsStore.addCompletion(newRecord);
				break;
			case 'DELETE':
				completionsStore.removeCompletion(oldRecord.task_id, oldRecord.completed_date);
				break;
		}
	}

	unsubscribe(): void {
		if (this.tasksChannel) {
			this.supabase.removeChannel(this.tasksChannel);
			this.tasksChannel = null;
		}
		if (this.completionsChannel) {
			this.supabase.removeChannel(this.completionsChannel);
			this.completionsChannel = null;
		}
	}
}
