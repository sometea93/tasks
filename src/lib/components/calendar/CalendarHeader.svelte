<script lang="ts">
	import type { CalendarViewMode } from '$lib/stores/calendar';

	interface Props {
		currentDate: Date;
		viewMode: CalendarViewMode;
		onPrevious: () => void;
		onNext: () => void;
		onToday: () => void;
		onViewModeChange: (mode: CalendarViewMode) => void;
	}

	let { currentDate, viewMode, onPrevious, onNext, onToday, onViewModeChange }: Props = $props();

	let monthYear = $derived(
		currentDate.toLocaleDateString('es-ES', {
			month: 'long',
			year: 'numeric'
		})
	);

	let weekRange = $derived.by(() => {
		if (viewMode !== 'week') return '';

		const day = currentDate.getDay();
		const diff = day === 0 ? -6 : 1 - day;

		const start = new Date(currentDate);
		start.setDate(currentDate.getDate() + diff);

		const end = new Date(start);
		end.setDate(start.getDate() + 6);

		const startStr = start.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
		const endStr = end.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

		return `${startStr} - ${endStr}`;
	});
</script>

<div class="flex items-center justify-between py-3 border-b border-[#f5f5f7]">
	<div class="flex items-center gap-2">
		<button
			onclick={onPrevious}
			class="p-2 rounded-lg hover:bg-[#f5f5f7] transition-colors"
			aria-label="Previous"
		>
			<svg class="w-5 h-5 text-[#1d1d1f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
		</button>

		<button
			onclick={onToday}
			class="px-3 py-1.5 text-[13px] font-medium text-[#007aff] hover:bg-[#007aff]/10 rounded-lg transition-colors"
		>
			Hoy
		</button>

		<button
			onclick={onNext}
			class="p-2 rounded-lg hover:bg-[#f5f5f7] transition-colors"
			aria-label="Next"
		>
			<svg class="w-5 h-5 text-[#1d1d1f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
			</svg>
		</button>

		<div class="ml-2">
			<h2 class="text-[17px] font-semibold text-[#1d1d1f] capitalize">{monthYear}</h2>
			{#if viewMode === 'week'}
				<p class="text-[13px] text-[#8e8e93]">{weekRange}</p>
			{/if}
		</div>
	</div>

	<div class="flex bg-[#f5f5f7] rounded-lg p-0.5">
		<button
			onclick={() => onViewModeChange('week')}
			class="px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors {viewMode === 'week'
				? 'bg-white text-[#1d1d1f] shadow-sm'
				: 'text-[#8e8e93] hover:text-[#1d1d1f]'}"
		>
			Semana
		</button>
		<button
			onclick={() => onViewModeChange('month')}
			class="px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors {viewMode === 'month'
				? 'bg-white text-[#1d1d1f] shadow-sm'
				: 'text-[#8e8e93] hover:text-[#1d1d1f]'}"
		>
			Mes
		</button>
	</div>
</div>
