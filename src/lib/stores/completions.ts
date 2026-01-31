import { writable, derived } from 'svelte/store';
import type { TaskCompletion } from '$lib/types/task-instance';
import { createCompletionKey } from '$lib/services/recurrence-service';

interface CompletionsState {
	completions: TaskCompletion[];
	loading: boolean;
	error: string | null;
}

function createCompletionsStore() {
	const { subscribe, set, update } = writable<CompletionsState>({
		completions: [],
		loading: false,
		error: null
	});

	return {
		subscribe,
		setCompletions: (completions: TaskCompletion[]) => {
			update((state) => ({ ...state, completions, loading: false, error: null }));
		},
		addCompletion: (completion: TaskCompletion) => {
			update((state) => ({
				...state,
				completions: state.completions.some((c) => c.id === completion.id)
					? state.completions
					: [...state.completions, completion]
			}));
		},
		removeCompletion: (taskId: string, completedDate: string) => {
			update((state) => ({
				...state,
				completions: state.completions.filter(
					(c) => !(c.task_id === taskId && c.completed_date === completedDate)
				)
			}));
		},
		removeCompletionById: (id: string) => {
			update((state) => ({
				...state,
				completions: state.completions.filter((c) => c.id !== id)
			}));
		},
		setLoading: (loading: boolean) => {
			update((state) => ({ ...state, loading }));
		},
		setError: (error: string | null) => {
			update((state) => ({ ...state, error, loading: false }));
		},
		reset: () => {
			set({ completions: [], loading: false, error: null });
		}
	};
}

export const completionsStore = createCompletionsStore();

/**
 * Derived store that provides O(1) lookup for completion status
 * Key format: "taskId_YYYY-MM-DD"
 */
export const completionSet = derived(completionsStore, ($store) => {
	const set = new Set<string>();
	for (const completion of $store.completions) {
		const key = createCompletionKey(completion.task_id, completion.completed_date);
		set.add(key);
	}
	return set;
});
