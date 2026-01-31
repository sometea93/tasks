<script lang="ts">
	import { parseTask } from '$lib/services/nlp-service';
	import { debounce } from '$lib/utils/debounce';
	import type { ParsedTask } from '$lib/types/nlp-response';
	import TaskPreview from './TaskPreview.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';

	interface Props {
		onSubmit: (task: ParsedTask, originalInput: string) => Promise<void>;
	}

	let { onSubmit }: Props = $props();

	let input = $state('');
	let parsedTask = $state<ParsedTask | null>(null);
	let parsing = $state(false);
	let parseError = $state<string | null>(null);
	let submitting = $state(false);

	const debouncedParse = debounce(async (text: string) => {
		if (!text.trim()) {
			parsedTask = null;
			parseError = null;
			parsing = false;
			return;
		}

		parsing = true;
		parseError = null;

		try {
			parsedTask = await parseTask(text);
		} catch (error) {
			parseError = error instanceof Error ? error.message : 'Failed to parse task';
			parsedTask = null;
		} finally {
			parsing = false;
		}
	}, 300);

	function handleInput() {
		if (input.trim()) {
			parsing = true;
			debouncedParse(input);
		} else {
			parsedTask = null;
			parseError = null;
		}
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!parsedTask || submitting) return;

		submitting = true;
		try {
			await onSubmit(parsedTask, input);
			input = '';
			parsedTask = null;
		} catch (error) {
			console.error('Failed to create task:', error);
		} finally {
			submitting = false;
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey && parsedTask && !submitting) {
			e.preventDefault();
			handleSubmit(e);
		}
	}
</script>

<div class="space-y-3">
	<form onsubmit={handleSubmit}>
		<div class="flex gap-2">
			<input
				type="text"
				bind:value={input}
				oninput={handleInput}
				onkeydown={handleKeyDown}
				placeholder="Add a task... (e.g., 'Meeting with Pedro tomorrow at 3pm, urgent')"
				class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				disabled={submitting}
			/>
			<Button type="submit" disabled={!parsedTask || submitting || parsing}>
				{#if submitting}
					<Spinner size="sm" />
				{:else}
					Add
				{/if}
			</Button>
		</div>
	</form>

	{#if input.trim()}
		<TaskPreview {parsedTask} loading={parsing} error={parseError} />
	{/if}
</div>
