import { writable, derived } from 'svelte/store';
import type { Task } from '$lib/types/task';

interface TasksState {
	tasks: Task[];
	loading: boolean;
	error: string | null;
}

function createTasksStore() {
	const { subscribe, set, update } = writable<TasksState>({
		tasks: [],
		loading: true,
		error: null
	});

	return {
		subscribe,
		setTasks: (tasks: Task[]) => {
			update((state) => ({ ...state, tasks, loading: false, error: null }));
		},
		addTask: (task: Task) => {
			update((state) => ({
				...state,
				// Prevent duplicates if task already exists (e.g., from optimistic update + realtime)
				tasks: state.tasks.some((t) => t.id === task.id)
					? state.tasks
					: [task, ...state.tasks]
			}));
		},
		updateTask: (id: string, updates: Partial<Task>) => {
			update((state) => ({
				...state,
				tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t))
			}));
		},
		removeTask: (id: string) => {
			update((state) => ({
				...state,
				tasks: state.tasks.filter((t) => t.id !== id)
			}));
		},
		setLoading: (loading: boolean) => {
			update((state) => ({ ...state, loading }));
		},
		setError: (error: string | null) => {
			update((state) => ({ ...state, error, loading: false }));
		},
		reset: () => {
			set({ tasks: [], loading: true, error: null });
		}
	};
}

export const tasksStore = createTasksStore();

// Derived store for active tasks only (sorted by priority then due date)
export const activeTasks = derived(tasksStore, ($store) =>
	$store.tasks
		.filter((t) => t.status === 'active')
		.sort((a, b) => {
			// Sort by priority first (1 = high priority comes first, null = no priority goes last)
			const aPrio = a.priority ?? 999;
			const bPrio = b.priority ?? 999;
			if (aPrio !== bPrio) {
				return aPrio - bPrio;
			}
			// Then by due date (earlier dates first, null dates last)
			if (a.due_date && b.due_date) {
				return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
			}
			if (a.due_date) return -1;
			if (b.due_date) return 1;
			// Finally by creation date (newest first)
			return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
		})
);
