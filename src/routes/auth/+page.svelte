<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { createBrowserClient } from '@supabase/ssr';
	import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
	import type { Database } from '$lib/types/database.types';
	import LoginForm from '$lib/components/auth/LoginForm.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let supabase = $state<ReturnType<typeof createBrowserClient<Database>> | null>(null);

	onMount(() => {
		supabase = createBrowserClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

		if (data.session) {
			goto('/');
		}

		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((event, session) => {
			if (session) {
				goto('/');
			}
		});

		return () => subscription.unsubscribe();
	});
</script>

<svelte:head>
	<title>Sign In</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-white px-4">
	{#if supabase}
		<LoginForm {supabase} />
	{/if}
</div>
