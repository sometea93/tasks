<script lang="ts">
	import type { Task } from '$lib/types/task';
	import type { TaskInstance } from '$lib/types/task-instance';
	import { calendarStore, displayBounds, type CalendarViewMode } from '$lib/stores/calendar';
	import { completionSet } from '$lib/stores/completions';
	import { CalendarService, getWeekBounds } from '$lib/services/calendar-service';
	import { formatDateKey } from '$lib/services/recurrence-service';
	import CalendarHeader from './CalendarHeader.svelte';
	import WeekView from './WeekView.svelte';
	import MonthView from './MonthView.svelte';
	import DayTasksModal from './DayTasksModal.svelte';

	interface Props {
		tasks: Task[];
		onCompleteInstance: (taskId: string, instanceDate: Date) => void;
	}

	let { tasks, onCompleteInstance }: Props = $props();

	let selectedDate: Date | null = $state(null);
	let calendarService = new CalendarService(null as any); // Service doesn't need supabase for expansion

	// Expand tasks to instances based on the current view bounds
	let taskInstances = $derived.by(() => {
		const bounds = $displayBounds;
		return calendarService.expandTasksToInstances(
			tasks,
			bounds.start,
			bounds.end,
			$completionSet
		);
	});

	// Group instances by date
	let tasksByDate = $derived(calendarService.groupTasksByDate(taskInstances));

	// Get week start for WeekView
	let weekStart = $derived.by(() => {
		const { start } = getWeekBounds($calendarStore.currentDate);
		return start;
	});

	// Tasks for selected date modal
	let selectedDateTasks = $derived.by(() => {
		if (!selectedDate) return [];
		const dateKey = formatDateKey(selectedDate);
		return tasksByDate.get(dateKey) || [];
	});

	function handleDayClick(date: Date) {
		selectedDate = date;
	}

	function handleCloseModal() {
		selectedDate = null;
	}

	function handleCompleteTask(taskId: string, instanceDate: Date) {
		onCompleteInstance(taskId, instanceDate);
	}
</script>

<div class="calendar-view">
	<CalendarHeader
		currentDate={$calendarStore.currentDate}
		viewMode={$calendarStore.viewMode}
		onPrevious={() => calendarStore.goToPrevious()}
		onNext={() => calendarStore.goToNext()}
		onToday={() => calendarStore.goToToday()}
		onViewModeChange={(mode) => calendarStore.setViewMode(mode)}
	/>

	{#if $calendarStore.viewMode === 'week'}
		<WeekView startDate={weekStart} {tasksByDate} onDayClick={handleDayClick} />
	{:else}
		<MonthView
			currentDate={$calendarStore.currentDate}
			{tasksByDate}
			onDayClick={handleDayClick}
		/>
	{/if}

	{#if selectedDate}
		<DayTasksModal
			date={selectedDate}
			tasks={selectedDateTasks}
			onClose={handleCloseModal}
			onCompleteTask={handleCompleteTask}
		/>
	{/if}
</div>
