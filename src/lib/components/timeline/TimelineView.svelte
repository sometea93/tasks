<script lang="ts">
	import { onMount } from 'svelte';
	import type { Task } from '$lib/types/task';
	import type { TaskInstance } from '$lib/types/task-instance';
	import { completionSet } from '$lib/stores/completions';
	import { CalendarService } from '$lib/services/calendar-service';
	import { formatDateKey } from '$lib/services/recurrence-service';
	import DaySection from './DaySection.svelte';

	interface Props {
		tasks: Task[];
		onCompleteInstance: (taskId: string, instanceDate: Date) => void;
		onCompleteAll: (taskId: string) => void;
		onDelete: (taskId: string) => void;
	}

	let { tasks, onCompleteInstance, onCompleteAll, onDelete }: Props = $props();

	let calendarService = new CalendarService(null as any);

	// Track the date range we're showing
	let startOffset = $state(-7); // Days before today
	let endOffset = $state(30); // Days after today
	let loading = $state(false);

	let scrollContainer: HTMLDivElement;
	let topSentinel: HTMLDivElement;
	let bottomSentinel: HTMLDivElement;

	// Calculate the date range
	let dateRange = $derived.by(() => {
		const now = new Date();
		now.setHours(0, 0, 0, 0);

		const start = new Date(now);
		start.setDate(now.getDate() + startOffset);

		const end = new Date(now);
		end.setDate(now.getDate() + endOffset);

		return { start, end };
	});

	// Generate array of dates
	let dates = $derived(calendarService.getDateRange(dateRange.start, dateRange.end));

	// Expand tasks to instances
	let taskInstances = $derived.by(() => {
		return calendarService.expandTasksToInstances(
			tasks,
			dateRange.start,
			dateRange.end,
			$completionSet
		);
	});

	// Group by date
	let tasksByDate = $derived(calendarService.groupTasksByDate(taskInstances));

	// Get the index of today for initial scroll
	let todayIndex = $derived.by(() => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		return dates.findIndex(
			(d) =>
				d.getFullYear() === today.getFullYear() &&
				d.getMonth() === today.getMonth() &&
				d.getDate() === today.getDate()
		);
	});

	function loadMorePast() {
		if (loading) return;
		loading = true;
		startOffset -= 14;
		setTimeout(() => {
			loading = false;
		}, 100);
	}

	function loadMoreFuture() {
		if (loading) return;
		loading = true;
		endOffset += 14;
		setTimeout(() => {
			loading = false;
		}, 100);
	}

	onMount(() => {
		// Set up intersection observers for infinite scroll
		const topObserver = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && !loading) {
					loadMorePast();
				}
			},
			{ threshold: 0.1 }
		);

		const bottomObserver = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && !loading) {
					loadMoreFuture();
				}
			},
			{ threshold: 0.1 }
		);

		if (topSentinel) topObserver.observe(topSentinel);
		if (bottomSentinel) bottomObserver.observe(bottomSentinel);

		// Scroll to today on mount
		setTimeout(() => {
			const todayElement = scrollContainer?.querySelector('[data-today="true"]');
			if (todayElement) {
				todayElement.scrollIntoView({ block: 'start', behavior: 'instant' });
			}
		}, 50);

		return () => {
			topObserver.disconnect();
			bottomObserver.disconnect();
		};
	});

	function scrollToToday() {
		const todayElement = scrollContainer?.querySelector('[data-today="true"]');
		if (todayElement) {
			todayElement.scrollIntoView({ block: 'start', behavior: 'smooth' });
		}
	}
</script>

<div class="timeline-view">
	<!-- Today button -->
	<div class="flex items-center justify-between py-2 border-b border-[#f5f5f7] sticky top-0 bg-white z-10">
		<h2 class="text-[17px] font-semibold text-[#1d1d1f]">Timeline</h2>
		<button
			onclick={scrollToToday}
			class="px-3 py-1.5 text-[13px] font-medium text-[#007aff] hover:bg-[#007aff]/10 rounded-lg transition-colors"
		>
			Ir a hoy
		</button>
	</div>

	<div bind:this={scrollContainer} class="timeline-scroll">
		<!-- Top sentinel for infinite scroll -->
		<div bind:this={topSentinel} class="h-1"></div>

		{#if loading && startOffset < -7}
			<div class="text-center py-2">
				<span class="text-[13px] text-[#8e8e93]">Cargando...</span>
			</div>
		{/if}

		{#each dates as date}
			{@const dateKey = formatDateKey(date)}
			{@const dayTasks = tasksByDate.get(dateKey) || []}
			{@const isToday =
				date.getFullYear() === new Date().getFullYear() &&
				date.getMonth() === new Date().getMonth() &&
				date.getDate() === new Date().getDate()}
			<div data-today={isToday}>
				<DaySection
					{date}
					tasks={dayTasks}
					onCompleteTask={onCompleteInstance}
					onCompleteAllTask={onCompleteAll}
					onDeleteTask={onDelete}
				/>
			</div>
		{/each}

		{#if loading && endOffset > 30}
			<div class="text-center py-2">
				<span class="text-[13px] text-[#8e8e93]">Cargando...</span>
			</div>
		{/if}

		<!-- Bottom sentinel for infinite scroll -->
		<div bind:this={bottomSentinel} class="h-1"></div>
	</div>
</div>
