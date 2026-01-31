import { writable, derived } from 'svelte/store';

export type CalendarViewMode = 'week' | 'month';

interface CalendarState {
	currentDate: Date;
	viewMode: CalendarViewMode;
	loading: boolean;
}

function createCalendarStore() {
	const { subscribe, set, update } = writable<CalendarState>({
		currentDate: new Date(),
		viewMode: 'week',
		loading: false
	});

	return {
		subscribe,
		setCurrentDate: (date: Date) => {
			update((state) => ({ ...state, currentDate: date }));
		},
		setViewMode: (mode: CalendarViewMode) => {
			update((state) => ({ ...state, viewMode: mode }));
		},
		goToToday: () => {
			update((state) => ({ ...state, currentDate: new Date() }));
		},
		goToPrevious: () => {
			update((state) => {
				const newDate = new Date(state.currentDate);
				if (state.viewMode === 'week') {
					newDate.setDate(newDate.getDate() - 7);
				} else {
					newDate.setMonth(newDate.getMonth() - 1);
				}
				return { ...state, currentDate: newDate };
			});
		},
		goToNext: () => {
			update((state) => {
				const newDate = new Date(state.currentDate);
				if (state.viewMode === 'week') {
					newDate.setDate(newDate.getDate() + 7);
				} else {
					newDate.setMonth(newDate.getMonth() + 1);
				}
				return { ...state, currentDate: newDate };
			});
		},
		setLoading: (loading: boolean) => {
			update((state) => ({ ...state, loading }));
		},
		reset: () => {
			set({ currentDate: new Date(), viewMode: 'week', loading: false });
		}
	};
}

export const calendarStore = createCalendarStore();

/**
 * Get the start and end dates for the current week view
 */
export const weekBounds = derived(calendarStore, ($store) => {
	const date = new Date($store.currentDate);
	const day = date.getDay();
	// Start on Monday (day 1), adjust if Sunday (day 0)
	const diff = day === 0 ? -6 : 1 - day;

	const start = new Date(date);
	start.setDate(date.getDate() + diff);
	start.setHours(0, 0, 0, 0);

	const end = new Date(start);
	end.setDate(start.getDate() + 6);
	end.setHours(23, 59, 59, 999);

	return { start, end };
});

/**
 * Get the start and end dates for the current month view
 */
export const monthBounds = derived(calendarStore, ($store) => {
	const date = new Date($store.currentDate);

	const start = new Date(date.getFullYear(), date.getMonth(), 1);
	start.setHours(0, 0, 0, 0);

	const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
	end.setHours(23, 59, 59, 999);

	return { start, end };
});

/**
 * Get the display range for the current view (extends month view to show full weeks)
 */
export const displayBounds = derived(calendarStore, ($store) => {
	const date = new Date($store.currentDate);

	if ($store.viewMode === 'week') {
		const day = date.getDay();
		const diff = day === 0 ? -6 : 1 - day;

		const start = new Date(date);
		start.setDate(date.getDate() + diff);
		start.setHours(0, 0, 0, 0);

		const end = new Date(start);
		end.setDate(start.getDate() + 6);
		end.setHours(23, 59, 59, 999);

		return { start, end };
	}

	// Month view - extend to full weeks
	const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
	const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

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
});
