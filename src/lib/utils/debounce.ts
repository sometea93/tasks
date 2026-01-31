export function debounce<T extends (...args: Parameters<T>) => void>(
	fn: T,
	delay: number = 300
): (...args: Parameters<T>) => void {
	let timeoutId: ReturnType<typeof setTimeout>;

	return (...args: Parameters<T>) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn(...args), delay);
	};
}

export function debounceAsync<T extends (...args: Parameters<T>) => Promise<ReturnType<T>>>(
	fn: T,
	delay: number = 300
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
	let timeoutId: ReturnType<typeof setTimeout>;
	let currentPromise: Promise<ReturnType<T>> | null = null;

	return (...args: Parameters<T>): Promise<ReturnType<T>> => {
		clearTimeout(timeoutId);

		return new Promise((resolve, reject) => {
			timeoutId = setTimeout(async () => {
				try {
					currentPromise = fn(...args);
					const result = await currentPromise;
					resolve(result);
				} catch (error) {
					reject(error);
				} finally {
					currentPromise = null;
				}
			}, delay);
		});
	};
}
