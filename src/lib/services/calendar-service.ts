import type { TypedSupabaseClient } from '$lib/supabase';
import type { Task } from '$lib/types/task';
import type { TaskInstance } from '$lib/types/task-instance';
import { recurrenceService, formatDateKey } from './recurrence-service';

export class CalendarService {
	constructor(private supabase: TypedSupabaseClient) {}

	/**
	 * Fetch active tasks that have a due date or recurrence rule
	 */
	async fetchScheduledTasks(): Promise<Task[]> {
		const { data, error } = await this.supabase
			.from('tasks')
			.select('*')
			.eq('status', 'active')
			.or('due_date.not.is.null,recurrence_rule.not.is.null')
			.order('due_date', { ascending: true, nullsFirst: false });

		if (error) throw error;
		return data;
	}

	/**
	 * Fetch tasks that fall within or recur in the given date range
	 */
	async fetchTasksInRange(startDate: Date, endDate: Date): Promise<Task[]> {
		// For now, fetch all scheduled tasks and filter client-side
		// This allows recurring tasks to be expanded properly
		return this.fetchScheduledTasks();
	}

	/**
	 * Expand all tasks into instances for a date range
	 * @param hideCompleted - If true, completed instances are filtered out (default: true)
	 */
	expandTasksToInstances(
		tasks: Task[],
		startDate: Date,
		endDate: Date,
		completedSet: Set<string>,
		hideCompleted: boolean = true
	): TaskInstance[] {
		const instances: TaskInstance[] = [];

		for (const task of tasks) {
			const taskInstances = recurrenceService.expandRecurringTask(
				task,
				startDate,
				endDate,
				completedSet
			);
			instances.push(...taskInstances);
		}

		// Filter out completed instances if requested
		const filtered = hideCompleted
			? instances.filter(i => !i.isCompleted)
			: instances;

		// Sort by date, then by priority (null priority goes last)
		return filtered.sort((a, b) => {
			const dateCompare = a.instanceDate.getTime() - b.instanceDate.getTime();
			if (dateCompare !== 0) return dateCompare;
			const aPrio = a.priority ?? 999;
			const bPrio = b.priority ?? 999;
			return aPrio - bPrio;
		});
	}

	/**
	 * Group task instances by date
	 */
	groupTasksByDate(instances: TaskInstance[]): Map<string, TaskInstance[]> {
		const grouped = new Map<string, TaskInstance[]>();

		for (const instance of instances) {
			const dateKey = formatDateKey(instance.instanceDate);
			const existing = grouped.get(dateKey) || [];
			existing.push(instance);
			grouped.set(dateKey, existing);
		}

		return grouped;
	}

	/**
	 * Get array of dates between start and end (inclusive)
	 */
	getDateRange(startDate: Date, endDate: Date): Date[] {
		const dates: Date[] = [];
		const current = new Date(startDate);
		current.setHours(0, 0, 0, 0);

		const end = new Date(endDate);
		end.setHours(0, 0, 0, 0);

		while (current <= end) {
			dates.push(new Date(current));
			current.setDate(current.getDate() + 1);
		}

		return dates;
	}
}

/**
 * Get the start and end dates for a week containing the given date
 * Week starts on Monday
 */
export function getWeekBounds(date: Date): { start: Date; end: Date } {
	const d = new Date(date);
	const day = d.getDay();
	// Adjust for Monday start (day 1), handle Sunday (day 0)
	const diff = day === 0 ? -6 : 1 - day;

	const start = new Date(d);
	start.setDate(d.getDate() + diff);
	start.setHours(0, 0, 0, 0);

	const end = new Date(start);
	end.setDate(start.getDate() + 6);
	end.setHours(23, 59, 59, 999);

	return { start, end };
}

/**
 * Get the start and end dates for a month containing the given date
 */
export function getMonthBounds(date: Date): { start: Date; end: Date } {
	const start = new Date(date.getFullYear(), date.getMonth(), 1);
	start.setHours(0, 0, 0, 0);

	const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
	end.setHours(23, 59, 59, 999);

	return { start, end };
}

/**
 * Get the display bounds for a month view (extends to full weeks)
 */
export function getMonthDisplayBounds(date: Date): { start: Date; end: Date } {
	const { start: monthStart, end: monthEnd } = getMonthBounds(date);

	// Find the Monday before or on the first of the month
	const startDay = monthStart.getDay();
	const startDiff = startDay === 0 ? -6 : 1 - startDay;
	const start = new Date(monthStart);
	start.setDate(monthStart.getDate() + startDiff);
	start.setHours(0, 0, 0, 0);

	// Find the Sunday after or on the last of the month
	const endDay = monthEnd.getDay();
	const endDiff = endDay === 0 ? 0 : 7 - endDay;
	const end = new Date(monthEnd);
	end.setDate(monthEnd.getDate() + endDiff);
	end.setHours(23, 59, 59, 999);

	return { start, end };
}

/**
 * Get the start and end dates for a year
 */
export function getYearBounds(date: Date): { start: Date; end: Date } {
	const start = new Date(date.getFullYear(), 0, 1);
	start.setHours(0, 0, 0, 0);

	const end = new Date(date.getFullYear(), 11, 31);
	end.setHours(23, 59, 59, 999);

	return { start, end };
}

/**
 * Format a date for display
 */
export function formatDateForDisplay(date: Date, format: 'short' | 'long' = 'short'): string {
	if (format === 'long') {
		return date.toLocaleDateString('es-ES', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
	return date.toLocaleDateString('es-ES', {
		month: 'short',
		day: 'numeric'
	});
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
	return (
		date1.getFullYear() === date2.getFullYear() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getDate() === date2.getDate()
	);
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
	return isSameDay(date, new Date());
}
