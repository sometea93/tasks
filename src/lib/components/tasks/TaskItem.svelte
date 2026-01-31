<script lang="ts">
	import { fly } from 'svelte/transition';
	import type { Task } from '$lib/types/task';
	import { recurrenceService } from '$lib/services/recurrence-service';

	interface Props {
		task: Task;
		onComplete: (id: string) => void;
		onCompleteInstance: (taskId: string, instanceDate: Date) => void;
		onDelete: (id: string) => void;
	}

	let { task, onComplete, onCompleteInstance, onDelete }: Props = $props();

	let completing = $state(false);
	let showMenu = $state(false);

	let formattedDateTime = $derived.by(() => {
		if (!task.due_date) return '';
		const date = new Date(task.due_date);
		const now = new Date();
		const tomorrow = new Date(now);
		tomorrow.setDate(tomorrow.getDate() + 1);

		let dateStr = '';
		if (date.toDateString() === now.toDateString()) {
			dateStr = 'Today';
		} else if (date.toDateString() === tomorrow.toDateString()) {
			dateStr = 'Tomorrow';
		} else {
			dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
		}

		const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
		return `${dateStr}, ${timeStr}`;
	});

	let isOverdue = $derived(task.due_date ? new Date(task.due_date) < new Date() : false);

	let recurrenceText = $derived(
		task.recurrence_rule
			? recurrenceService.formatRecurrenceForDisplay(task.recurrence_rule)
			: ''
	);

	let priorityColor = $derived.by(() => {
		switch (task.priority) {
			case 1: return { border: 'border-[#ff3b30]', bg: 'bg-[#ff3b30]', text: 'text-[#ff3b30]', label: 'High' };
			case 2: return { border: 'border-[#ff9500]', bg: 'bg-[#ff9500]', text: 'text-[#ff9500]', label: 'Medium' };
			case 3: return { border: 'border-[#007aff]', bg: 'bg-[#007aff]', text: 'text-[#007aff]', label: 'Low' };
			default: return { border: 'border-[#c7c7cc]', bg: 'bg-[#c7c7cc]', text: 'text-[#8e8e93]', label: '' };
		}
	});

	function handleComplete() {
		if (completing) return;
		completing = true;

		setTimeout(() => {
			if (task.recurrence_rule) {
				// For recurring tasks, complete today's instance
				onCompleteInstance(task.id, new Date());
				completing = false;
			} else {
				// For non-recurring tasks, complete the whole task
				onComplete(task.id);
			}
		}, 400);
	}

	function handleCompleteAll() {
		showMenu = false;
		completing = true;
		setTimeout(() => {
			onComplete(task.id);
		}, 400);
	}

	function handleDelete() {
		showMenu = false;
		onDelete(task.id);
	}

	function toggleMenu(e: Event) {
		e.stopPropagation();
		showMenu = !showMenu;
	}

	function closeMenu() {
		showMenu = false;
	}
</script>

<svelte:window on:click={closeMenu} />

<div
	class="flex items-start gap-3 py-4 border-b border-[#f5f5f7] last:border-0 transition-all duration-300 relative"
	class:opacity-50={completing}
	class:translate-x-2={completing}
	in:fly={{ x: -20, duration: 200 }}
>
	<button
		onclick={handleComplete}
		class="flex-shrink-0 w-[22px] h-[22px] rounded-full border-2 {priorityColor.border} transition-all duration-200 mt-0.5 flex items-center justify-center {completing ? priorityColor.bg : 'hover:bg-[#f5f5f7]'}"
		aria-label={task.recurrence_rule ? "Complete today's instance" : "Complete task"}
		disabled={completing}
	>
		{#if completing}
			<svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
				<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
			</svg>
		{/if}
	</button>

	<div class="flex-1 min-w-0 transition-all duration-300" class:line-through={completing} class:text-[#8e8e93]={completing}>
		<p class="text-[15px] text-[#1d1d1f] leading-snug" class:text-[#8e8e93]={completing}>{task.title}</p>

		<div class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
			{#if formattedDateTime}
				<span class="text-[13px] {isOverdue && !completing ? 'text-[#ff3b30]' : 'text-[#8e8e93]'}">
					{formattedDateTime}
				</span>
			{/if}

			{#if recurrenceText}
				<div class="flex items-center gap-1">
					<svg class="w-3.5 h-3.5 text-[#8e8e93]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
						/>
					</svg>
					<span class="text-[13px] text-[#8e8e93]">{recurrenceText}</span>
				</div>
			{/if}

			{#if priorityColor.label}
				<span class="text-[13px] font-medium {completing ? 'text-[#8e8e93]' : priorityColor.text}">
					{priorityColor.label}
				</span>
			{/if}
		</div>
	</div>

	<!-- Menu button -->
	<button
		onclick={toggleMenu}
		class="flex-shrink-0 p-1.5 -mr-1.5 rounded-lg hover:bg-[#f5f5f7] transition-colors"
		aria-label="Task options"
	>
		<svg class="w-5 h-5 text-[#8e8e93]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
		</svg>
	</button>

	<!-- Dropdown menu -->
	{#if showMenu}
		<div
			class="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-[#e5e5ea] py-1 min-w-[180px] z-20"
			transition:fly={{ y: -10, duration: 150 }}
		>
			{#if task.recurrence_rule}
				<button
					onclick={handleCompleteAll}
					class="w-full px-4 py-2.5 text-left text-[15px] text-[#1d1d1f] hover:bg-[#f5f5f7] flex items-center gap-2"
				>
					<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					Complete all instances
				</button>
			{/if}
			<button
				onclick={handleDelete}
				class="w-full px-4 py-2.5 text-left text-[15px] text-[#ff3b30] hover:bg-[#f5f5f7] flex items-center gap-2"
			>
				<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
				</svg>
				Delete task
			</button>
		</div>
	{/if}
</div>
