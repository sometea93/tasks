<script lang="ts">
	import { page } from '$app/stores';

	const tabs = [
		{ href: '/', label: 'Tasks', icon: 'list' },
		{ href: '/calendar', label: 'Calendar', icon: 'calendar' },
		{ href: '/timeline', label: 'Timeline', icon: 'timeline' }
	];

	let currentPath = $derived($page.url.pathname);
</script>

<nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-[#f5f5f7] z-40 safe-area-pb">
	<div class="max-w-lg mx-auto flex">
		{#each tabs as tab}
			{@const isActive = currentPath === tab.href}
			<a
				href={tab.href}
				class="flex-1 flex flex-col items-center py-2 px-3 transition-colors {isActive
					? 'text-[#007aff]'
					: 'text-[#8e8e93] hover:text-[#1d1d1f]'}"
			>
				{#if tab.icon === 'list'}
					<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width={isActive ? 2.5 : 2}
							d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
						/>
					</svg>
				{:else if tab.icon === 'calendar'}
					<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width={isActive ? 2.5 : 2}
							d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
						/>
					</svg>
				{:else if tab.icon === 'timeline'}
					<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width={isActive ? 2.5 : 2}
							d="M4 6h16M4 10h16M4 14h16M4 18h16"
						/>
					</svg>
				{/if}
				<span class="text-[11px] font-medium mt-1">{tab.label}</span>
			</a>
		{/each}
	</div>
</nav>

<style>
	.safe-area-pb {
		padding-bottom: env(safe-area-inset-bottom, 0);
	}
</style>
