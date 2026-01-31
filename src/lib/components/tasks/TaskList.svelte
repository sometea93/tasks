<script lang="ts">
	import type { Task } from '$lib/types/task';
	import TaskItem from './TaskItem.svelte';

	interface Props {
		tasks: Task[];
		loading?: boolean;
		onComplete: (id: string) => void;
		onCompleteInstance: (taskId: string, instanceDate: Date) => void;
		onDelete: (id: string) => void;
	}

	let { tasks, loading = false, onComplete, onCompleteInstance, onDelete }: Props = $props();
</script>

<div>
	{#if loading}
		<div class="py-12 text-center">
			<p class="text-[15px] text-[#8e8e93]">Loading...</p>
		</div>
	{:else if tasks.length === 0}
		<div class="py-12 text-center">
			<p class="text-[15px] text-[#8e8e93]">No tasks</p>
		</div>
	{:else}
		{#each tasks as task (task.id)}
			<TaskItem {task} {onComplete} {onCompleteInstance} {onDelete} />
		{/each}
	{/if}
</div>
