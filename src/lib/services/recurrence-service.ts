import { RRule } from 'rrule';
import type { Task } from '$lib/types/task';
import type { TaskInstance } from '$lib/types/task-instance';

const DAY_NAMES: Record<string, string> = {
	MO: 'lunes',
	TU: 'martes',
	WE: 'miércoles',
	TH: 'jueves',
	FR: 'viernes',
	SA: 'sábado',
	SU: 'domingo'
};

const DAY_NAMES_EN: Record<string, string> = {
	MO: 'Monday',
	TU: 'Tuesday',
	WE: 'Wednesday',
	TH: 'Thursday',
	FR: 'Friday',
	SA: 'Saturday',
	SU: 'Sunday'
};

export class RecurrenceService {
	/**
	 * Expands a recurring task into individual instances within the given date range
	 */
	expandRecurringTask(
		task: Task,
		startDate: Date,
		endDate: Date,
		completedDates: Set<string>
	): TaskInstance[] {
		if (!task.recurrence_rule) {
			// Non-recurring task - check if it falls within range
			if (task.due_date) {
				const dueDate = new Date(task.due_date);
				if (dueDate >= startDate && dueDate <= endDate) {
					return [
						{
							id: task.id,
							parentTaskId: task.id,
							title: task.title,
							priority: task.priority as 1 | 2 | 3,
							instanceDate: dueDate,
							isRecurring: false,
							recurrenceRule: null,
							isCompleted: task.status === 'completed'
						}
					];
				}
			}
			return [];
		}

		try {
			// Parse the RRULE and generate occurrences
			const rule = RRule.fromString(task.recurrence_rule);

			// Use task's due_date as the starting point, or task creation date
			const taskStart = task.due_date ? new Date(task.due_date) : new Date(task.created_at);

			// Create a new rule with the task's start date
			const ruleWithStart = new RRule({
				...rule.origOptions,
				dtstart: taskStart
			});

			// Get occurrences within the date range
			const occurrences = ruleWithStart.between(startDate, endDate, true);

			return occurrences.map((date) => {
				const dateStr = formatDateKey(date);
				const instanceId = `${task.id}_${dateStr}`;

				return {
					id: instanceId,
					parentTaskId: task.id,
					title: task.title,
					priority: task.priority as 1 | 2 | 3,
					instanceDate: date,
					isRecurring: true,
					recurrenceRule: task.recurrence_rule,
					isCompleted: completedDates.has(`${task.id}_${dateStr}`)
				};
			});
		} catch (error) {
			console.error('Failed to parse recurrence rule:', task.recurrence_rule, error);
			return [];
		}
	}

	/**
	 * Formats an RRULE string into a human-readable format
	 */
	formatRecurrenceForDisplay(rruleStr: string | null, locale: 'es' | 'en' = 'es'): string {
		if (!rruleStr) return '';

		try {
			const rule = RRule.fromString(rruleStr);
			const options = rule.origOptions;

			const dayNames = locale === 'es' ? DAY_NAMES : DAY_NAMES_EN;

			// DAILY
			if (options.freq === RRule.DAILY) {
				if (options.interval && options.interval > 1) {
					return locale === 'es'
						? `Cada ${options.interval} días`
						: `Every ${options.interval} days`;
				}
				return locale === 'es' ? 'Todos los días' : 'Every day';
			}

			// WEEKLY
			if (options.freq === RRule.WEEKLY) {
				if (options.byweekday) {
					const days = Array.isArray(options.byweekday)
						? options.byweekday
						: [options.byweekday];
					const dayStrings = days.map((d) => {
						// d can be a number, a Weekday object, or a string like "MO"
						let weekday: number;
						if (typeof d === 'number') {
							weekday = d;
						} else if (typeof d === 'string') {
							// It's a WeekdayStr like "MO"
							const dayMap: Record<string, number> = { MO: 0, TU: 1, WE: 2, TH: 3, FR: 4, SA: 5, SU: 6 };
							weekday = dayMap[d] ?? 0;
						} else {
							// It's a Weekday object
							weekday = (d as { weekday: number }).weekday;
						}
						const dayCode = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'][weekday];
						return dayNames[dayCode] || dayCode;
					});

					if (dayStrings.length === 1) {
						return locale === 'es'
							? `Cada ${dayStrings[0]}`
							: `Every ${dayStrings[0]}`;
					}
					const lastDay = dayStrings.pop();
					return locale === 'es'
						? `Cada ${dayStrings.join(', ')} y ${lastDay}`
						: `Every ${dayStrings.join(', ')} and ${lastDay}`;
				}
				if (options.interval && options.interval > 1) {
					return locale === 'es'
						? `Cada ${options.interval} semanas`
						: `Every ${options.interval} weeks`;
				}
				return locale === 'es' ? 'Cada semana' : 'Every week';
			}

			// MONTHLY
			if (options.freq === RRule.MONTHLY) {
				if (options.bymonthday) {
					const day = Array.isArray(options.bymonthday)
						? options.bymonthday[0]
						: options.bymonthday;
					return locale === 'es'
						? `El día ${day} de cada mes`
						: `On day ${day} of each month`;
				}
				if (options.interval && options.interval > 1) {
					return locale === 'es'
						? `Cada ${options.interval} meses`
						: `Every ${options.interval} months`;
				}
				return locale === 'es' ? 'Cada mes' : 'Every month';
			}

			// YEARLY
			if (options.freq === RRule.YEARLY) {
				return locale === 'es' ? 'Cada año' : 'Every year';
			}

			// Fallback to rrule's built-in text
			return rule.toText();
		} catch {
			return rruleStr;
		}
	}

	/**
	 * Parse an RRULE string and return the RRule object
	 */
	parseRule(rruleStr: string): RRule | null {
		try {
			return RRule.fromString(rruleStr);
		} catch {
			return null;
		}
	}

	/**
	 * Get the next occurrence after a given date
	 */
	getNextOccurrence(rruleStr: string, afterDate: Date): Date | null {
		try {
			const rule = RRule.fromString(rruleStr);
			const next = rule.after(afterDate, false);
			return next;
		} catch {
			return null;
		}
	}
}

/**
 * Format a date as YYYY-MM-DD for use as a completion key
 */
export function formatDateKey(date: Date): string {
	return date.toISOString().split('T')[0];
}

/**
 * Create a completion key from task ID and date
 */
export function createCompletionKey(taskId: string, date: Date | string): string {
	const dateStr = typeof date === 'string' ? date : formatDateKey(date);
	return `${taskId}_${dateStr}`;
}

export const recurrenceService = new RecurrenceService();
