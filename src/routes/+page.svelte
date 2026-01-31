<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { createBrowserClient } from '@supabase/ssr';
	import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
	import type { Database } from '$lib/types/database.types';
	import { tasksStore, activeTasks } from '$lib/stores/tasks';
	import { authStore } from '$lib/stores/auth';
	import { TaskService } from '$lib/services/task-service';
	import { RealtimeManager } from '$lib/services/realtime-manager';
	import type { ParsedTask } from '$lib/types/nlp-response';
	import TaskInput from '$lib/components/tasks/TaskInput.svelte';
	import TaskList from '$lib/components/tasks/TaskList.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let taskService: TaskService | null = null;
	let realtimeManager: RealtimeManager | null = null;
	let supabase: ReturnType<typeof createBrowserClient<Database>> | null = null;

	onMount(() => {
		supabase = createBrowserClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
		taskService = new TaskService(supabase);

		// Initialize store with server-loaded data
		tasksStore.setTasks(data.tasks);

		// Setup realtime subscription
		if ($authStore.user) {
			realtimeManager = new RealtimeManager(supabase, $authStore.user.id);
			realtimeManager.subscribe();
		}
	});

	onDestroy(() => {
		realtimeManager?.unsubscribe();
	});

	async function handleCreateTask(parsedTask: ParsedTask, originalInput: string) {
		if (!$authStore.user || !taskService) return;

		await taskService.createTask(
			{
				title: parsedTask.title,
				priority: parsedTask.priority,
				due_date: parsedTask.dueDate,
				recurrence_rule: parsedTask.recurrenceRule,
				original_input: originalInput
			},
			$authStore.user.id
		);
	}

	async function handleCompleteTask(id: string) {
		if (!taskService) return;
		await taskService.completeTask(id);
		tasksStore.removeTask(id);
	}

	async function handleDeleteTask(id: string) {
		if (!taskService) return;
		await taskService.deleteTask(id);
		tasksStore.removeTask(id);
	}

	async function handleLogout() {
		if (!supabase) return;
		await supabase.auth.signOut();
		window.location.href = '/auth';
	}
</script>

<svelte:head>
	<title>Task Manager</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-4 py-8">
	<header class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-2xl font-bold text-gray-900">Tasks</h1>
			<p class="text-sm text-gray-500">Manage your tasks with natural language</p>
		</div>
		<Button variant="ghost" onclick={handleLogout}>
			Sign Out
		</Button>
	</header>

	<main class="space-y-6">
		<TaskInput onSubmit={handleCreateTask} />

		<TaskList
			tasks={$activeTasks}
			loading={$tasksStore.loading}
			onComplete={handleCompleteTask}
			onDelete={handleDeleteTask}
		/>
	</main>
</div>
