<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import type { TaskInstance } from '$lib/types/task-instance';
	import { isToday } from '$lib/services/calendar-service';
	import { recurrenceService } from '$lib/services/recurrence-service';

	interface Props {
		date: Date;
		tasks: TaskInstance[];
		onClose: () => void;
		onCompleteTask: (taskId: string, instanceDate: Date) => void;
	}

	let { date, tasks, onClose, onCompleteTask }: Props = $props();

	let formattedDate = $derived(
		date.toLocaleDateString('es-ES', {
			weekday: 'long',
			day: 'numeric',
			month: 'long'
		})
	);

	let sortedTasks = $derived(
		[...tasks].sort((a, b) => {
			// Completed tasks at the bottom
			if (a.isCompleted !== b.isCompleted) {
				return a.isCompleted ? 1 : -1;
			}
			// Then by priority
			return a.priority - b.priority;
		})
	);

	function getPriorityColor(priority: number): {
		border: string;
		bg: string;
		text: string;
	} {
		switch (priority) {
			case 1:
				return { border: 'border-[#ff3b30]', bg: 'bg-[#ff3b30]', text: 'text-[#ff3b30]' };
			case 2:
				return { border: 'border-[#ff9500]', bg: 'bg-[#ff9500]', text: 'text-[#ff9500]' };
			case 3:
				return { border: 'border-[#007aff]', bg: 'bg-[#007aff]', text: 'text-[#007aff]' };
			default:
				return { border: 'border-[#c7c7cc]', bg: 'bg-[#c7c7cc]', text: 'text-[#8e8e93]' };
		}
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="fixed inset-0 bg-black/30 z-50 flex items-end sm:items-center justify-center"
	transition:fade={{ duration: 150 }}
	onclick={onClose}
>
	<div
		class="bg-white w-full sm:w-[400px] sm:max-h-[80vh] max-h-[70vh] rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col"
		transition:fly={{ y: 100, duration: 200 }}
		onclick={(e) => e.stopPropagation()}
	>
		<!-- Header -->
		<div class="flex items-center justify-between p-4 border-b border-[#f5f5f7]">
			<div>
				<h3 class="text-[17px] font-semibold text-[#1d1d1f] capitalize">
					{formattedDate}
				</h3>
				{#if isToday(date)}
					<span class="text-[13px] text-[#007aff] font-medium">Hoy</span>
				{/if}
			</div>
			<button
				onclick={onClose}
				class="p-2 rounded-full hover:bg-[#f5f5f7] transition-colors"
				aria-label="Close"
			>
				<svg class="w-5 h-5 text-[#8e8e93]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		</div>

		<!-- Tasks list -->
		<div class="flex-1 overflow-y-auto p-4">
			{#if sortedTasks.length === 0}
				<div class="text-center py-8">
					<p class="text-[15px] text-[#8e8e93]">No hay tareas para este día</p>
				</div>
			{:else}
				<div class="space-y-2">
					{#each sortedTasks as task}
						{@const color = getPriorityColor(task.priority)}
						<div
							class="flex items-start gap-3 p-3 rounded-xl {task.isCompleted
								? 'bg-[#f5f5f7]/50'
								: 'bg-[#f5f5f7]'}"
						>
							<button
								onclick={() => onCompleteTask(task.parentTaskId, task.instanceDate)}
								class="flex-shrink-0 w-[22px] h-[22px] rounded-full border-2 {color.border} transition-all duration-200 mt-0.5 flex items-center justify-center {task.isCompleted ? color.bg : 'hover:bg-[#f5f5f7]'}"
								aria-label={task.isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
							>
								{#if task.isCompleted}
									<svg
										class="w-3 h-3 text-white"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										stroke-width="3"
									>
										<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
									</svg>
								{/if}
							</button>

							<div class="flex-1 min-w-0">
								<p
									class="text-[15px] leading-snug {task.isCompleted
										? 'text-[#8e8e93] line-through'
										: 'text-[#1d1d1f]'}"
								>
									{task.title}
								</p>

								{#if task.isRecurring && task.recurrenceRule}
									<div class="flex items-center gap-1 mt-1">
										<svg
											class="w-3 h-3 text-[#8e8e93]"
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
										<span class="text-[12px] text-[#8e8e93]">
											{recurrenceService.formatRecurrenceForDisplay(task.recurrenceRule)}
										</span>
									</div>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>
