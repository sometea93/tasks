import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { parseTaskWithAI } from '$lib/server/openai';
import type { NLPResponse } from '$lib/types/nlp-response';

export const POST: RequestHandler = async ({ request, locals }) => {
	// Require authentication
	if (!locals.user) {
		return json({ success: false, error: 'Unauthorized' } satisfies NLPResponse, { status: 401 });
	}

	try {
		const { input } = await request.json();

		if (!input || typeof input !== 'string' || input.trim().length === 0) {
			return json(
				{ success: false, error: 'Input is required' } satisfies NLPResponse,
				{ status: 400 }
			);
		}

		const parsedTask = await parseTaskWithAI(input.trim());

		return json({ success: true, data: parsedTask } satisfies NLPResponse);
	} catch (error) {
		console.error('Error parsing task:', error);
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Failed to parse task'
			} satisfies NLPResponse,
			{ status: 500 }
		);
	}
};
