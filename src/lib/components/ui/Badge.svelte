<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'high' | 'normal' | 'low' | 'default';
		children: Snippet;
	}

	let { variant = 'default', children }: Props = $props();

	const variants = {
		high: 'text-[#ff3b30]',
		normal: 'text-[#007aff]',
		low: 'text-[#8e8e93]',
		default: 'text-[#8e8e93]'
	};
</script>

<span class="text-[13px] font-medium {variants[variant]}">
	{@render children()}
</span>
