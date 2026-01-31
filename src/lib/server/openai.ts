import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';
import type { ParsedTask } from '$lib/types/nlp-response';

const openai = new OpenAI({
	apiKey: OPENAI_API_KEY
});

function getTimezoneOffset(timezone: string, date: Date = new Date()): string {
	try {
		const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
		const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
		const offsetMinutes = (tzDate.getTime() - utcDate.getTime()) / 60000;
		const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
		const offsetMins = Math.abs(offsetMinutes) % 60;
		const sign = offsetMinutes >= 0 ? '+' : '-';
		return sign + String(offsetHours).padStart(2, '0') + ':' + String(offsetMins).padStart(2, '0');
	} catch {
		return '+00:00';
	}
}

export async function parseTaskWithAI(input: string, timezone: string = 'UTC'): Promise<ParsedTask> {
	// Get current date/time in user's timezone
	const now = new Date();
	const formatter = new Intl.DateTimeFormat('en-CA', {
		timeZone: timezone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	});
	const today = formatter.format(now);
	const tomorrow = formatter.format(new Date(now.getTime() + 24 * 60 * 60 * 1000));

	// Get timezone offset for the user's timezone
	const offsetStr = getTimezoneOffset(timezone, now);

	const instructions = `Parse task. Today: ${today}, Tomorrow: ${tomorrow}

Examples (non-recurring):
"reunión mañana a las 3pm" → {"title":"reunión","priority":null,"dueDate":"${tomorrow}T15:00:00","recurrenceRule":null}
"ir a comer en la noche" → {"title":"ir a comer","priority":null,"dueDate":"${today}T20:00:00","recurrenceRule":null}
"cenar en la noche" → {"title":"cenar","priority":null,"dueDate":"${today}T20:00:00","recurrenceRule":null}
"urgente llamar doctor" → {"title":"llamar doctor","priority":1,"dueDate":null,"recurrenceRule":null}
"comprar pan prioridad alta" → {"title":"comprar pan","priority":1,"dueDate":null,"recurrenceRule":null}
"revisar correo prioridad media" → {"title":"revisar correo","priority":2,"dueDate":null,"recurrenceRule":null}
"limpiar cuarto baja prioridad" → {"title":"limpiar cuarto","priority":3,"dueDate":null,"recurrenceRule":null}
"ir a comer" → {"title":"ir a comer","priority":null,"dueDate":null,"recurrenceRule":null}
"comprar pan" → {"title":"comprar pan","priority":null,"dueDate":null,"recurrenceRule":null}

Examples (recurring):
"tomar medicina todos los días" → {"title":"tomar medicina","priority":null,"dueDate":"${today}T09:00:00","recurrenceRule":"FREQ=DAILY"}
"reunión cada lunes" → {"title":"reunión","priority":null,"dueDate":null,"recurrenceRule":"FREQ=WEEKLY;BYDAY=MO"}
"gym lunes miércoles viernes" → {"title":"gym","priority":null,"dueDate":null,"recurrenceRule":"FREQ=WEEKLY;BYDAY=MO,WE,FR"}
"cada 3 días ir a jugar tenis a las 5pm" → {"title":"ir a jugar tenis","priority":null,"dueDate":"${today}T17:00:00","recurrenceRule":"FREQ=DAILY;INTERVAL=3"}
"revisar cada 2 días" → {"title":"revisar","priority":null,"dueDate":"${today}T09:00:00","recurrenceRule":"FREQ=DAILY;INTERVAL=2"}
"pagar renta día 15 de cada mes urgente" → {"title":"pagar renta","priority":1,"dueDate":null,"recurrenceRule":"FREQ=MONTHLY;BYMONTHDAY=15"}
"llamar a mamá cada domingo" → {"title":"llamar a mamá","priority":null,"dueDate":null,"recurrenceRule":"FREQ=WEEKLY;BYDAY=SU"}
"daily standup" → {"title":"daily standup","priority":null,"dueDate":"${today}T09:00:00","recurrenceRule":"FREQ=DAILY"}
"every monday meeting" → {"title":"meeting","priority":null,"dueDate":null,"recurrenceRule":"FREQ=WEEKLY;BYDAY=MO"}

Rules:
- Time expressions: "en la noche"/"noche"=20:00, "en la tarde"/"tarde"=15:00, "en la mañana"=09:00, "temprano"=08:00, "mediodía"=12:00
- Date: "mañana"(tomorrow)=tomorrow, "hoy"=today. If only time-of-day mentioned without date, use today.
- PRIORITY (IMPORTANT - only set if explicitly mentioned):
  * "urgente"/"importante"/"prioridad alta"/"high priority" → priority: 1
  * "prioridad media"/"medium priority" → priority: 2
  * "prioridad baja"/"baja prioridad"/"low priority" → priority: 3
  * If NO priority indicator is mentioned → priority: null (DEFAULT)
- IMPORTANT: If NO date/time indicator AND NO recurrence pattern exists, dueDate MUST be null.
- Recurrence rules (RRULE format):
  * "todos los días"/"diario"/"daily" → FREQ=DAILY
  * "cada X días" → FREQ=DAILY;INTERVAL=X
  * "cada lunes"/"every monday" → FREQ=WEEKLY;BYDAY=MO (MO,TU,WE,TH,FR,SA,SU)
  * "lunes y miércoles" → FREQ=WEEKLY;BYDAY=MO,WE
  * "día X de cada mes" → FREQ=MONTHLY;BYMONTHDAY=X
  * "cada semana" → FREQ=WEEKLY
  * "cada mes" → FREQ=MONTHLY
- For recurring tasks with time, set dueDate to today at that time. For recurring without time, dueDate can be null.
Output ONLY JSON: {"title":"...","priority":1|2|3|null,"dueDate":"YYYY-MM-DDTHH:MM:SS"|null,"recurrenceRule":"RRULE_STRING"|null}`;

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

	const parsed = JSON.parse(jsonMatch[0]) as ParsedTask;

	// Validate and fix the date
	if (parsed.dueDate) {
		// Check if it already has timezone
		const hasTimezone = /([+-]\d{2}:\d{2}|Z)$/.test(parsed.dueDate);

		if (!hasTimezone) {
			// Validate the date format (YYYY-MM-DDTHH:MM:SS)
			const dateMatch = parsed.dueDate.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
			if (dateMatch) {
				parsed.dueDate = parsed.dueDate + offsetStr;
			} else {
				// Invalid format - set to null
				console.warn('Invalid date format from OpenAI:', parsed.dueDate);
				parsed.dueDate = null;
			}
		}

		// Final validation - check if Date can parse it
		if (parsed.dueDate && isNaN(new Date(parsed.dueDate).getTime())) {
			console.warn('Unparseable date:', parsed.dueDate);
			parsed.dueDate = null;
		}
	}

	return parsed;
}
