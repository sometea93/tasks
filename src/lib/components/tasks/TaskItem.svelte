<script lang="ts">
	import type { Task } from '$lib/types/task';
	import { PRIORITY_LABELS } from '$lib/types/task';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	interface Props {
		task: Task;
		onComplete: (id: string) => void;
		onDelete: (id: string) => void;
	}

	let { task, onComplete, onDelete }: Props = $props();

	function formatDate(dateString: string | null): string {
		if (!dateString) return '';
		const date = new Date(dateString);
		const now = new Date();
		const tomorrow = new Date(now);
		tomorrow.setDate(tomorrow.getDate() + 1);

		if (date.toDateString() === now.toDateString()) {
			return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
		}
		if (date.toDateString() === tomorrow.toDateString()) {
			return `Tomorrow at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
		}
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		});
	}

	function isOverdue(dateString: string | null): boolean {
		if (!dateString) return false;
		return new Date(dateString) < new Date();
	}

	const priorityVariant = (p: number) => {
		if (p === 1) return 'high';
		if (p === 3) return 'low';
		return 'normal';
	};
</script>

<div
	class="group flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
>
	<button
		onclick={() => onComplete(task.id)}
		class="flex-shrink-0 w-5 h-5 rounded-full border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors"
		aria-label="Complete task"
	></button>

	<div class="flex-1 min-w-0">
		<p class="font-medium text-gray-900 truncate">{task.title}</p>
		<div class="flex flex-wrap items-center gap-2 mt-1">
			<Badge variant={priorityVariant(task.priority)}>
				{PRIORITY_LABELS[task.priority as 1 | 2 | 3]}
			</Badge>
			{#if task.due_date}
				<span
					class="text-xs {isOverdue(task.due_date) ? 'text-red-600 font-medium' : 'text-gray-500'}"
				>
					{formatDate(task.due_date)}
				</span>
			{/if}
			{#if task.recurrence_rule}
				<span class="text-xs text-gray-500">Recurring</span>
			{/if}
		</div>
	</div>

	<div class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
		<Button variant="ghost" size="sm" onclick={() => onDelete(task.id)}>
			Delete
		</Button>
	</div>
</div>
