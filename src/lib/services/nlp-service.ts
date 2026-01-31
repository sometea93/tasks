import type { NLPResponse, ParsedTask } from '$lib/types/nlp-response';

export async function parseTask(input: string): Promise<ParsedTask> {
	const response = await fetch('/api/parse-task', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			input,
			timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
		})
	});

	const result: NLPResponse = await response.json();

	if (!result.success || !result.data) {
		throw new Error(result.error || 'Failed to parse task');
	}

	return result.data;
}
