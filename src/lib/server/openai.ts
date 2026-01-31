import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';
import type { ParsedTask } from '$lib/types/nlp-response';

const openai = new OpenAI({
	apiKey: OPENAI_API_KEY
});

export async function parseTaskWithAI(input: string): Promise<ParsedTask> {
	const now = new Date();
	const today = now.toISOString().split('T')[0];
	const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

	const instructions = `Parse task. Today: ${today}, Tomorrow: ${tomorrow}

Examples:
"reunión mañana a las 3pm" → {"title":"reunión","priority":2,"dueDate":"${tomorrow}T15:00:00","recurrenceRule":null}
"comprar leche a las 3am" → {"title":"comprar leche","priority":2,"dueDate":"${today}T03:00:00","recurrenceRule":null}
"comer mañana temprano" → {"title":"comer","priority":2,"dueDate":"${tomorrow}T08:00:00","recurrenceRule":null}
"urgente llamar doctor" → {"title":"llamar doctor","priority":1,"dueDate":null,"recurrenceRule":null}

Rules: 3am=03:00, 3pm=15:00, temprano=08:00, mañana=tomorrow, urgente=priority 1
Output ONLY JSON: {"title":"...","priority":1|2|3,"dueDate":"YYYY-MM-DDTHH:MM:SS"|null,"recurrenceRule":null}`;

	const response = await openai.responses.create({
		model: 'gpt-4.1-nano',
		instructions: instructions,
		input: input
	});

	const content = response.output_text;
	if (!content) {
		throw new Error('No response from OpenAI');
	}

	const jsonMatch = content.match(/\{[\s\S]*\}/);
	if (!jsonMatch) {
		throw new Error('No valid JSON in response');
	}

	return JSON.parse(jsonMatch[0]) as ParsedTask;
}
