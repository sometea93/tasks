export interface ParsedTask {
	title: string;
	priority: 1 | 2 | 3;
	dueDate: string | null;
	recurrenceRule: string | null;
}

export interface NLPResponse {
	success: boolean;
	data?: ParsedTask;
	error?: string;
}
