<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { createBrowserClient } from '@supabase/ssr';
	import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
	import type { Database } from '$lib/types/database.types';
	import { tasksStore } from '$lib/stores/tasks';
	import { completionsStore } from '$lib/stores/completions';
	import { authStore } from '$lib/stores/auth';
	import { TaskService } from '$lib/services/task-service';
	import { CompletionService } from '$lib/services/completion-service';
	import { RealtimeManager } from '$lib/services/realtime-manager';
	import CalendarView from '$lib/components/calendar/CalendarView.svelte';
	import NavTabs from '$lib/components/ui/NavTabs.svelte';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let taskService: TaskService | null = null;
	let completionService: CompletionService | null = null;
	let realtimeManager: RealtimeManager | null = null;
	let supabase: ReturnType<typeof createBrowserClient<Database>> | null = null;

	onMount(() => {
		supabase = createBrowserClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
		taskService = new TaskService(supabase);
		completionService = new CompletionService(supabase);

		tasksStore.setTasks(data.tasks);
		completionsStore.setCompletions(data.completions);

		if ($authStore.user) {
			realtimeManager = new RealtimeManager(supabase, $authStore.user.id);
			realtimeManager.subscribe();
		}
	});

	onDestroy(() => {
		realtimeManager?.unsubscribe();
	});

	async function handleCompleteInstance(taskId: string, instanceDate: Date) {
		if (!$authStore.user || !completionService || !taskService) return;

		const task = $tasksStore.tasks.find((t) => t.id === taskId);
		if (!task) return;

		// For non-recurring tasks, complete the task itself
		if (!task.recurrence_rule) {
			await taskService.completeTask(taskId);
			tasksStore.removeTask(taskId);
			return;
		}

		// For recurring tasks, create a completion record
		try {
			const completion = await completionService.completeInstance(
				taskId,
				instanceDate,
				$authStore.user.id
			);
			completionsStore.addCompletion(completion);
		} catch (error) {
			console.error('Failed to complete instance:', error);
		}
	}

	async function handleLogout() {
		if (!supabase) return;
		await supabase.auth.signOut();
		window.location.href = '/auth';
	}
</script>

<svelte:head>
	<title>Calendar - Tasks</title>
</svelte:head>

<div class="min-h-screen bg-white pb-20">
	<div class="max-w-lg mx-auto px-4">
		<header class="flex items-center justify-between py-4 border-b border-[#f5f5f7]">
			<h1 class="text-[28px] font-bold text-[#1d1d1f]">Calendar</h1>
			<button onclick={handleLogout} class="text-[15px] text-[#007aff] hover:text-[#0056b3]">
				Sign Out
			</button>
		</header>

		<main class="py-2">
			<CalendarView tasks={$tasksStore.tasks} onCompleteInstance={handleCompleteInstance} />
		</main>
	</div>

	<NavTabs />
</div>
