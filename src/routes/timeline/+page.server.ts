import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(303, '/auth');
	}

	// Fetch active tasks with due dates or recurrence rules
	const { data: tasks, error: tasksError } = await locals.supabase
		.from('tasks')
		.select('*')
		.eq('status', 'active')
		.or('due_date.not.is.null,recurrence_rule.not.is.null')
		.order('due_date', { ascending: true, nullsFirst: false });

	if (tasksError) {
		console.error('Failed to fetch tasks:', tasksError);
	}

	// Fetch completions for an extended range (6 months back and forward)
	const now = new Date();
	const startDate = new Date(now);
	startDate.setMonth(now.getMonth() - 6);
	const endDate = new Date(now);
	endDate.setMonth(now.getMonth() + 6);

	const startStr = startDate.toISOString().split('T')[0];
	const endStr = endDate.toISOString().split('T')[0];

	const { data: completions, error: completionsError } = await locals.supabase
		.from('task_completions')
		.select('*')
		.gte('completed_date', startStr)
		.lte('completed_date', endStr);

	if (completionsError) {
		console.error('Failed to fetch completions:', completionsError);
	}

	return {
		tasks: tasks ?? [],
		completions: completions ?? []
	};
};
