<script lang="ts">
	import type { Task } from '$lib/types/task';
	import TaskItem from './TaskItem.svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';

	interface Props {
		tasks: Task[];
		loading?: boolean;
		onComplete: (id: string) => void;
		onDelete: (id: string) => void;
	}

	let { tasks, loading = false, onComplete, onDelete }: Props = $props();
</script>

<div class="space-y-2">
	{#if loading}
		<div class="flex items-center justify-center py-12">
			<Spinner size="lg" />
		</div>
	{:else if tasks.length === 0}
		<div class="text-center py-12">
			<p class="text-gray-500">No tasks yet. Add your first task above!</p>
		</div>
	{:else}
		{#each tasks as task (task.id)}
			<TaskItem {task} {onComplete} {onDelete} />
		{/each}
	{/if}
</div>
