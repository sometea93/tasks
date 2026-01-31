<script lang="ts">
	import type { TaskInstance } from '$lib/types/task-instance';
	import DayCell from './DayCell.svelte';
	import { isToday } from '$lib/services/calendar-service';
	import { formatDateKey } from '$lib/services/recurrence-service';

	interface Props {
		startDate: Date;
		tasksByDate: Map<string, TaskInstance[]>;
		onDayClick: (date: Date) => void;
	}

	let { startDate, tasksByDate, onDayClick }: Props = $props();

	const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

	let weekDays = $derived.by(() => {
		const days: Date[] = [];
		for (let i = 0; i < 7; i++) {
			const day = new Date(startDate);
			day.setDate(startDate.getDate() + i);
			days.push(day);
		}
		return days;
	});
</script>

<div class="mt-2">
	<!-- Day headers -->
	<div class="grid grid-cols-7 gap-1 mb-1">
		{#each DAY_NAMES as name, i}
			<div class="text-center text-[13px] font-medium text-[#8e8e93] py-1">
				{name}
			</div>
		{/each}
	</div>

	<!-- Day cells -->
	<div class="grid grid-cols-7 gap-1">
		{#each weekDays as date}
			{@const dateKey = formatDateKey(date)}
			{@const tasks = tasksByDate.get(dateKey) || []}
			<DayCell {date} {tasks} onClick={onDayClick} />
		{/each}
	</div>

	<!-- Task list for the week -->
	<div class="mt-4 space-y-1">
		{#each weekDays as date}
			{@const dateKey = formatDateKey(date)}
			{@const tasks = tasksByDate.get(dateKey) || []}
			{@const incompleteTasks = tasks.filter((t) => !t.isCompleted)}
			{#if incompleteTasks.length > 0}
				<div class="py-2">
					<div class="flex items-center gap-2 mb-1">
						<span
							class="text-[13px] font-medium {isToday(date)
								? 'text-[#007aff]'
								: 'text-[#8e8e93]'}"
						>
							{date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}
						</span>
						{#if isToday(date)}
							<span class="text-[11px] text-[#007aff] font-medium">Hoy</span>
						{/if}
					</div>
					<div class="space-y-1 pl-2">
						{#each incompleteTasks.slice(0, 3) as task}
							<div class="flex items-center gap-2">
								<span
									class="w-2 h-2 rounded-full flex-shrink-0 {task.priority === 1
										? 'bg-[#ff3b30]'
										: task.priority === 2
											? 'bg-[#ff9500]'
											: 'bg-[#007aff]'}"
								></span>
								<span class="text-[13px] text-[#1d1d1f] truncate">{task.title}</span>
								{#if task.isRecurring}
									<svg
										class="w-3 h-3 text-[#8e8e93] flex-shrink-0"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
										/>
									</svg>
								{/if}
							</div>
						{/each}
						{#if incompleteTasks.length > 3}
							<button
								onclick={() => onDayClick(date)}
								class="text-[12px] text-[#007aff] hover:underline pl-4"
							>
								+{incompleteTasks.length - 3} más
							</button>
						{/if}
					</div>
				</div>
			{/if}
		{/each}
	</div>
</div>
