import type { RealtimeChannel } from '@supabase/supabase-js';
import type { TypedSupabaseClient } from '$lib/supabase';
import type { Task } from '$lib/types/task';
import { tasksStore } from '$lib/stores/tasks';

type TaskPayload = {
	eventType: 'INSERT' | 'UPDATE' | 'DELETE';
	new: Task;
	old: { id: string };
};

export class RealtimeManager {
	private channel: RealtimeChannel | null = null;

	constructor(
		private supabase: TypedSupabaseClient,
		private userId: string
	) {}

	subscribe(): void {
		if (this.channel) {
			this.unsubscribe();
		}

		this.channel = this.supabase
			.channel(`tasks:${this.userId}`)
			.on<Task>(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'tasks',
					filter: `user_id=eq.${this.userId}`
				},
				(payload) => this.handleChange(payload as unknown as TaskPayload)
			)
			.subscribe();
	}

	private handleChange(payload: TaskPayload): void {
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

	unsubscribe(): void {
		if (this.channel) {
			this.supabase.removeChannel(this.channel);
			this.channel = null;
		}
	}
}
