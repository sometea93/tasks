import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(303, '/auth');
	}

	// Fetch initial tasks
	const { data: tasks, error } = await locals.supabase
		.from('tasks')
		.select('*')
		.eq('status', 'active')
		.order('priority', { ascending: true })
		.order('due_date', { ascending: true, nullsFirst: false })
		.order('created_at', { ascending: false });

	if (error) {
		console.error('Failed to fetch tasks:', error);
		return { tasks: [] };
	}

	return { tasks: tasks ?? [] };
};
