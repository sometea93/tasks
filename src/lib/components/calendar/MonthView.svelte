<script lang="ts">
	import type { TaskInstance } from '$lib/types/task-instance';
	import DayCell from './DayCell.svelte';
	import { getMonthDisplayBounds } from '$lib/services/calendar-service';
	import { formatDateKey } from '$lib/services/recurrence-service';

	interface Props {
		currentDate: Date;
		tasksByDate: Map<string, TaskInstance[]>;
		onDayClick: (date: Date) => void;
	}

	let { currentDate, tasksByDate, onDayClick }: Props = $props();

	const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

	let calendarDays = $derived.by(() => {
		const { start, end } = getMonthDisplayBounds(currentDate);
		const days: { date: Date; isCurrentMonth: boolean }[] = [];
		const current = new Date(start);
		const currentMonth = currentDate.getMonth();

		while (current <= end) {
			days.push({
				date: new Date(current),
				isCurrentMonth: current.getMonth() === currentMonth
			});
			current.setDate(current.getDate() + 1);
		}

		return days;
	});

	let weeks = $derived.by(() => {
		const result: { date: Date; isCurrentMonth: boolean }[][] = [];
		for (let i = 0; i < calendarDays.length; i += 7) {
			result.push(calendarDays.slice(i, i + 7));
		}
		return result;
	});
</script>

<div class="mt-2">
	<!-- Day headers -->
	<div class="grid grid-cols-7 gap-1 mb-1">
		{#each DAY_NAMES as name}
			<div class="text-center text-[13px] font-medium text-[#8e8e93] py-1">
				{name}
			</div>
		{/each}
	</div>

	<!-- Calendar grid -->
	<div class="space-y-1">
		{#each weeks as week}
			<div class="grid grid-cols-7 gap-1">
				{#each week as { date, isCurrentMonth }}
					{@const dateKey = formatDateKey(date)}
					{@const tasks = tasksByDate.get(dateKey) || []}
					<DayCell {date} {tasks} {isCurrentMonth} isCompact onClick={onDayClick} />
				{/each}
			</div>
		{/each}
	</div>
</div>
