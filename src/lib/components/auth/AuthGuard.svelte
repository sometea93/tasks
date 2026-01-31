<script lang="ts">
	import type { Snippet } from 'svelte';
	import { authStore } from '$lib/stores/auth';
	import Spinner from '$lib/components/ui/Spinner.svelte';

	interface Props {
		children: Snippet;
		fallback?: Snippet;
	}

	let { children, fallback }: Props = $props();
</script>

{#if $authStore.loading}
	<div class="flex items-center justify-center min-h-[200px]">
		<Spinner size="lg" />
	</div>
{:else if $authStore.user}
	{@render children()}
{:else if fallback}
	{@render fallback()}
{:else}
	<div class="text-center py-8">
		<p class="text-gray-600">Please sign in to continue.</p>
	</div>
{/if}
