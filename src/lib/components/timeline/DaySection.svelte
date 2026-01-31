<script lang="ts">
	import type { TaskInstance } from '$lib/types/task-instance';
	import { isToday } from '$lib/services/calendar-service';
	import TimelineTaskItem from './TimelineTaskItem.svelte';

	interface Props {
		date: Date;
		tasks: TaskInstance[];
		onCompleteTask: (taskId: string, instanceDate: Date) => void;
		onCompleteAllTask: (taskId: string) => void;
		onDeleteTask: (taskId: string) => void;
	}

	let { date, tasks, onCompleteTask, onCompleteAllTask, onDeleteTask }: Props = $props();

	let today = $derived(isToday(date));

	let formattedDate = $derived.by(() => {
		const now = new Date();
		const tomorrow = new Date(now);
		tomorrow.setDate(tomorrow.getDate() + 1);
		const yesterday = new Date(now);
		yesterday.setDate(yesterday.getDate() - 1);

		if (isToday(date)) {
			return 'Hoy';
		}
		if (
			date.getFullYear() === tomorrow.getFullYear() &&
			date.getMonth() === tomorrow.getMonth() &&
			date.getDate() === tomorrow.getDate()
		) {
			return 'Mañana';
		}
		if (
			date.getFullYear() === yesterday.getFullYear() &&
			date.getMonth() === yesterday.getMonth() &&
			date.getDate() === yesterday.getDate()
		) {
			return 'Ayer';
		}

		return date.toLocaleDateString('es-ES', {
			weekday: 'long',
			day: 'numeric',
			month: 'long'
		});
	});

	let sortedTasks = $derived(
		[...tasks].sort((a, b) => {
			// Completed at the bottom
			if (a.isCompleted !== b.isCompleted) {
				return a.isCompleted ? 1 : -1;
			}
			// Then by time
			return a.instanceDate.getTime() - b.instanceDate.getTime();
		})
	);

	let incompleteTasks = $derived(tasks.filter((t) => !t.isCompleted));
</script>

<div class="day-section py-3 border-b border-[#f5f5f7] last:border-0">
	<div class="flex items-center justify-between mb-2">
		<h3
			class="text-[15px] font-semibold capitalize {today ? 'text-[#007aff]' : 'text-[#1d1d1f]'}"
		>
			{formattedDate}
		</h3>
		{#if incompleteTasks.length > 0}
			<span class="text-[13px] text-[#8e8e93]">
				{incompleteTasks.length} {incompleteTasks.length === 1 ? 'tarea' : 'tareas'}
			</span>
		{/if}
	</div>

	{#if sortedTasks.length === 0}
		<p class="text-[14px] text-[#8e8e93] py-2">Sin tareas</p>
	{:else}
		<div class="space-y-1">
			{#each sortedTasks as task (task.id)}
				<TimelineTaskItem
					{task}
					onComplete={onCompleteTask}
					onCompleteAll={onCompleteAllTask}
					onDelete={onDeleteTask}
				/>
			{/each}
		</div>
	{/if}
</div>
