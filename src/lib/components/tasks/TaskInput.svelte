<script lang="ts">
	import { parseTask } from '$lib/services/nlp-service';
	import { debounce } from '$lib/utils/debounce';
	import type { ParsedTask } from '$lib/types/nlp-response';
	import TaskPreview from './TaskPreview.svelte';

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

<div>
	<form onsubmit={handleSubmit}>
		<div class="flex items-center gap-3 py-3 border-b border-[#f5f5f7]">
			<div class="w-[22px] h-[22px] rounded-full border-[1.5px] border-[#c7c7cc] flex-shrink-0"></div>
			<input
				type="text"
				bind:value={input}
				oninput={handleInput}
				onkeydown={handleKeyDown}
				placeholder="Add a task"
				class="flex-1 text-[15px] text-[#1d1d1f] placeholder-[#8e8e93] bg-transparent border-0 outline-none"
				disabled={submitting}
			/>
			{#if parsedTask && !parsing}
				<button
					type="submit"
					disabled={submitting}
					class="text-[15px] font-medium text-[#007aff] hover:text-[#0056b3] disabled:opacity-50"
				>
					Add
				</button>
			{/if}
		</div>
	</form>

	{#if input.trim()}
		<TaskPreview {parsedTask} loading={parsing} error={parseError} />
	{/if}
</div>
