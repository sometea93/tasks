<script lang="ts">
	import type { ParsedTask } from '$lib/types/nlp-response';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import { PRIORITY_LABELS } from '$lib/types/task';

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

	function formatRecurrence(rule: string | null): string {
		if (!rule) return '';
		// Simple RRULE parsing for display
		if (rule.includes('FREQ=DAILY')) return 'Daily';
		if (rule.includes('FREQ=WEEKLY')) {
			const match = rule.match(/BYDAY=([A-Z,]+)/);
			if (match) {
				const days = match[1].split(',').map((d) => {
					const dayMap: Record<string, string> = {
						MO: 'Mon',
						TU: 'Tue',
						WE: 'Wed',
						TH: 'Thu',
						FR: 'Fri',
						SA: 'Sat',
						SU: 'Sun'
					};
					return dayMap[d] || d;
				});
				return `Weekly on ${days.join(', ')}`;
			}
			return 'Weekly';
		}
		if (rule.includes('FREQ=MONTHLY')) return 'Monthly';
		return rule;
	}

	const priorityVariant = (p: number) => {
		if (p === 1) return 'high';
		if (p === 3) return 'low';
		return 'normal';
	};
</script>

{#if loading}
	<div class="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
		<Spinner size="sm" />
		<span class="text-sm text-gray-600">Analyzing task...</span>
	</div>
{:else if error}
	<div class="p-3 bg-red-50 rounded-lg border border-red-200">
		<p class="text-sm text-red-600">{error}</p>
	</div>
{:else if parsedTask}
	<div class="p-3 bg-blue-50 rounded-lg border border-blue-200">
		<div class="flex items-start justify-between gap-2">
			<div class="flex-1">
				<p class="font-medium text-gray-900">{parsedTask.title}</p>
				<div class="flex flex-wrap items-center gap-2 mt-2">
					<Badge variant={priorityVariant(parsedTask.priority)}>
						{PRIORITY_LABELS[parsedTask.priority as 1 | 2 | 3]}
					</Badge>
					{#if parsedTask.dueDate}
						<span class="text-xs text-gray-600">
							{formatDate(parsedTask.dueDate)}
						</span>
					{/if}
					{#if parsedTask.recurrenceRule}
						<span class="text-xs text-gray-600">
							{formatRecurrence(parsedTask.recurrenceRule)}
						</span>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}
