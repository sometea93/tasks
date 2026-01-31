<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
		size?: 'sm' | 'md' | 'lg';
		fullWidth?: boolean;
		children: Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		fullWidth = false,
		children,
		class: className = '',
		...rest
	}: Props = $props();

	const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-colors disabled:opacity-50';

	const variants = {
		primary: 'bg-[#007aff] text-white hover:bg-[#0056b3]',
		secondary: 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]',
		danger: 'bg-[#ff3b30] text-white hover:bg-[#d63029]',
		ghost: 'text-[#007aff] hover:text-[#0056b3]'
	};

	const sizes = {
		sm: 'px-3 py-1.5 text-[13px]',
		md: 'px-4 py-2 text-[15px]',
		lg: 'px-6 py-3 text-[17px]'
	};
</script>

<button
	class="{baseStyles} {variants[variant]} {sizes[size]} {fullWidth ? 'w-full' : ''} {className}"
	{...rest}
>
	{@render children()}
</button>
