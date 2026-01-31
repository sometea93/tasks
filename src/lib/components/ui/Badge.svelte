<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'high' | 'normal' | 'low' | 'default';
		children: Snippet;
	}

	let { variant = 'default', children }: Props = $props();

	const variants = {
		high: 'bg-red-100 text-red-800',
		normal: 'bg-blue-100 text-blue-800',
		low: 'bg-gray-100 text-gray-800',
		default: 'bg-gray-100 text-gray-600'
	};
</script>

<span
	class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {variants[variant]}"
>
	{@render children()}
</span>
