<script lang="ts">
	import type { ParsedTask } from '$lib/types/nlp-response';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import { PRIORITY_LABELS, PRIORITY_COLORS } from '$lib/types/task';
	import { recurrenceService } from '$lib/services/recurrence-service';

	interface Props {
		parsedTask: ParsedTask | null;
		loading?: boolean;
		error?: string | null;
	}

	let { parsedTask, loading = false, error = null }: Props = $props();

	function formatDate(dateString: string | null): string {
		if (!dateString) return '';
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			weekday: 'short',
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		});
	}

	let priorityColor = $derived(
		parsedTask ? PRIORITY_COLORS[parsedTask.priority as 1 | 2 | 3] || '#8e8e93' : '#8e8e93'
	);

	let priorityLabel = $derived(
		parsedTask ? PRIORITY_LABELS[parsedTask.priority as 1 | 2 | 3] || '' : ''
	);

	let recurrenceText = $derived(
		parsedTask?.recurrenceRule
			? recurrenceService.formatRecurrenceForDisplay(parsedTask.recurrenceRule, 'en')
			: ''
	);
</script>

{#if loading}
	<div class="flex items-center gap-2 py-3 px-4 bg-[#f5f5f7] rounded-xl mt-3">
		<Spinner size="sm" />
		<span class="text-[13px] text-[#8e8e93]">Analyzing...</span>
	</div>
{:else if error}
	<div class="py-3 px-4 bg-[#fff5f5] rounded-xl mt-3">
		<p class="text-[13px] text-[#ff3b30]">{error}</p>
	</div>
{:else if parsedTask}
	<div class="py-3 px-4 bg-[#f5f5f7] rounded-xl mt-3">
		<p class="text-[15px] text-[#1d1d1f] font-medium">{parsedTask.title}</p>
		<div class="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
			{#if priorityLabel}
				<span class="text-[13px] font-medium" style="color: {priorityColor}">
					{priorityLabel}
				</span>
			{/if}
			{#if parsedTask.dueDate}
				<span class="text-[13px] text-[#8e8e93]">
					{formatDate(parsedTask.dueDate)}
				</span>
			{/if}
			{#if recurrenceText}
				<span class="text-[13px] text-[#8e8e93]">
					{recurrenceText}
				</span>
			{/if}
		</div>
	</div>
{/if}
