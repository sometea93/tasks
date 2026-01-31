<script lang="ts">
	import type { TaskInstance } from '$lib/types/task-instance';
	import { isToday, isSameDay } from '$lib/services/calendar-service';

	interface Props {
		date: Date;
		tasks: TaskInstance[];
		isCurrentMonth?: boolean;
		isCompact?: boolean;
		onClick: (date: Date) => void;
	}

	let { date, tasks, isCurrentMonth = true, isCompact = false, onClick }: Props = $props();

	let today = $derived(isToday(date));
	let dayNumber = $derived(date.getDate());
	let incompleteTasks = $derived(tasks.filter((t) => !t.isCompleted));

	// Group tasks by priority for dots display
	let priorityGroups = $derived.by(() => {
		const groups = { high: 0, medium: 0, low: 0 };
		for (const task of incompleteTasks) {
			if (task.priority === 1) groups.high++;
			else if (task.priority === 2) groups.medium++;
			else groups.low++;
		}
		return groups;
	});

	let hasHighPriority = $derived(priorityGroups.high > 0);
	let hasMediumPriority = $derived(priorityGroups.medium > 0);
	let hasLowPriority = $derived(priorityGroups.low > 0);
</script>

<button
	onclick={() => onClick(date)}
	class="relative flex flex-col items-center justify-start p-1 min-h-[60px] rounded-lg transition-colors
		{isCurrentMonth ? 'hover:bg-[#f5f5f7]' : 'opacity-40 hover:opacity-60'}
		{today ? 'bg-[#007aff]/5' : ''}"
>
	<span
		class="text-[15px] font-medium w-7 h-7 flex items-center justify-center rounded-full
			{today ? 'bg-[#007aff] text-white' : isCurrentMonth ? 'text-[#1d1d1f]' : 'text-[#8e8e93]'}"
	>
		{dayNumber}
	</span>

	{#if incompleteTasks.length > 0}
		<div class="flex gap-0.5 mt-1 flex-wrap justify-center max-w-full">
			{#if hasHighPriority}
				<span class="w-1.5 h-1.5 rounded-full bg-[#ff3b30]"></span>
			{/if}
			{#if hasMediumPriority}
				<span class="w-1.5 h-1.5 rounded-full bg-[#ff9500]"></span>
			{/if}
			{#if hasLowPriority}
				<span class="w-1.5 h-1.5 rounded-full bg-[#007aff]"></span>
			{/if}
		</div>

		{#if !isCompact && incompleteTasks.length > 0}
			<span class="text-[11px] text-[#8e8e93] mt-0.5">
				{incompleteTasks.length}
			</span>
		{/if}
	{/if}
</button>
