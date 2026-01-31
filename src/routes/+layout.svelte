<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { invalidate } from '$app/navigation';
	import { createBrowserClient } from '@supabase/ssr';
	import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
	import { authStore } from '$lib/stores/auth';
	import type { Database } from '$lib/types/database.types';
	import '../app.css';

	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: any } = $props();

	$effect(() => {
		authStore.setSession(data.session, data.user);
	});

	onMount(() => {
		const supabase = createBrowserClient<Database>(
			PUBLIC_SUPABASE_URL,
			PUBLIC_SUPABASE_ANON_KEY
		);

		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((event, session) => {
			if (session?.expires_at !== data.session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => subscription.unsubscribe();
	});
</script>

<div class="min-h-screen bg-gray-50">
	{@render children()}
</div>
