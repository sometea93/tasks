<script lang="ts">
	import type { TypedSupabaseClient } from '$lib/supabase';
	import Button from '$lib/components/ui/Button.svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';

	interface Props {
		supabase: TypedSupabaseClient;
	}

	let { supabase }: Props = $props();

	let email = $state('');
	let password = $state('');
	let isSignUp = $state(false);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let message = $state<string | null>(null);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		loading = true;
		error = null;
		message = null;

		if (isSignUp) {
			const { error: signUpError } = await supabase.auth.signUp({
				email,
				password,
				options: {
					emailRedirectTo: `${window.location.origin}/auth/callback`
				}
			});

			if (signUpError) {
				error = signUpError.message;
			} else {
				message = 'Check your email for the confirmation link!';
			}
		} else {
			const { error: signInError } = await supabase.auth.signInWithPassword({
				email,
				password
			});

			if (signInError) {
				error = signInError.message;
			}
		}

		loading = false;
	}

	async function handleOAuthLogin(provider: 'google' | 'github') {
		loading = true;
		error = null;

		const { error: oauthError } = await supabase.auth.signInWithOAuth({
			provider,
			options: {
				redirectTo: `${window.location.origin}/auth/callback`
			}
		});

		if (oauthError) {
			error = oauthError.message;
			loading = false;
		}
	}
</script>

<div class="w-full max-w-md mx-auto">
	<div class="bg-white rounded-lg shadow-md p-8">
		<h2 class="text-2xl font-bold text-center mb-6">
			{isSignUp ? 'Create Account' : 'Welcome Back'}
		</h2>

		<form onsubmit={handleSubmit} class="space-y-4">
			<div>
				<label for="email" class="block text-sm font-medium text-gray-700 mb-1">
					Email
				</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					required
					class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					placeholder="you@example.com"
				/>
			</div>

			<div>
				<label for="password" class="block text-sm font-medium text-gray-700 mb-1">
					Password
				</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					required
					minlength="6"
					class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					placeholder="••••••••"
				/>
			</div>

			{#if error}
				<div class="p-3 bg-red-50 border border-red-200 rounded-md">
					<p class="text-sm text-red-600">{error}</p>
				</div>
			{/if}

			{#if message}
				<div class="p-3 bg-green-50 border border-green-200 rounded-md">
					<p class="text-sm text-green-600">{message}</p>
				</div>
			{/if}

			<Button type="submit" disabled={loading} fullWidth>
				{#if loading}
					<Spinner size="sm" />
				{:else}
					{isSignUp ? 'Sign Up' : 'Sign In'}
				{/if}
			</Button>
		</form>

		<div class="mt-6">
			<div class="relative">
				<div class="absolute inset-0 flex items-center">
					<div class="w-full border-t border-gray-300"></div>
				</div>
				<div class="relative flex justify-center text-sm">
					<span class="px-2 bg-white text-gray-500">Or continue with</span>
				</div>
			</div>

			<div class="mt-4 grid grid-cols-2 gap-3">
				<button
					type="button"
					onclick={() => handleOAuthLogin('google')}
					disabled={loading}
					class="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
				>
					Google
				</button>
				<button
					type="button"
					onclick={() => handleOAuthLogin('github')}
					disabled={loading}
					class="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
				>
					GitHub
				</button>
			</div>
		</div>

		<p class="mt-6 text-center text-sm text-gray-600">
			{isSignUp ? 'Already have an account?' : "Don't have an account?"}
			<button
				type="button"
				onclick={() => (isSignUp = !isSignUp)}
				class="ml-1 font-medium text-blue-600 hover:text-blue-500"
			>
				{isSignUp ? 'Sign In' : 'Sign Up'}
			</button>
		</p>
	</div>
</div>
