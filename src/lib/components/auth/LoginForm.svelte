<script lang="ts">
	import type { TypedSupabaseClient } from '$lib/supabase';
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
			loading = false;
		} else {
			const { error: signInError, data } = await supabase.auth.signInWithPassword({
				email,
				password
			});

			if (signInError) {
				error = signInError.message;
				loading = false;
			} else if (data.session) {
				// Redirect immediately after successful login
				window.location.href = '/';
				return;
			}
		}
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

<div class="w-full max-w-sm">
	<div class="text-center mb-8">
		<h1 class="text-2xl font-semibold text-[#1d1d1f] tracking-tight">
			{isSignUp ? 'Create your account' : 'Sign in'}
		</h1>
	</div>

	<form onsubmit={handleSubmit} class="space-y-4">
		<div>
			<input
				id="email"
				type="email"
				bind:value={email}
				required
				class="w-full h-12 px-4 bg-white border border-[#d2d2d7] rounded-xl text-[#1d1d1f] placeholder-[#86868b] focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition-colors"
				placeholder="Email"
			/>
		</div>

		<div>
			<input
				id="password"
				type="password"
				bind:value={password}
				required
				minlength="6"
				class="w-full h-12 px-4 bg-white border border-[#d2d2d7] rounded-xl text-[#1d1d1f] placeholder-[#86868b] focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition-colors"
				placeholder="Password"
			/>
		</div>

		{#if error}
			<p class="text-sm text-[#ff3b30]">{error}</p>
		{/if}

		{#if message}
			<p class="text-sm text-[#34c759]">{message}</p>
		{/if}

		<button
			type="submit"
			disabled={loading}
			class="w-full h-12 bg-[#0071e3] text-white font-medium rounded-xl hover:bg-[#0077ed] disabled:opacity-50 transition-colors"
		>
			{#if loading}
				<Spinner size="sm" />
			{:else}
				{isSignUp ? 'Create Account' : 'Sign In'}
			{/if}
		</button>
	</form>

	<div class="mt-8">
		<div class="flex items-center gap-4 mb-6">
			<div class="flex-1 h-px bg-[#d2d2d7]"></div>
			<span class="text-xs text-[#86868b]">or</span>
			<div class="flex-1 h-px bg-[#d2d2d7]"></div>
		</div>

		<div class="space-y-3">
			<button
				type="button"
				onclick={() => handleOAuthLogin('google')}
				disabled={loading}
				class="w-full h-12 bg-white border border-[#d2d2d7] rounded-xl text-[#1d1d1f] font-medium hover:bg-[#f5f5f7] disabled:opacity-50 transition-colors"
			>
				Continue with Google
			</button>
			<button
				type="button"
				onclick={() => handleOAuthLogin('github')}
				disabled={loading}
				class="w-full h-12 bg-white border border-[#d2d2d7] rounded-xl text-[#1d1d1f] font-medium hover:bg-[#f5f5f7] disabled:opacity-50 transition-colors"
			>
				Continue with GitHub
			</button>
		</div>
	</div>

	<p class="mt-8 text-center text-sm text-[#86868b]">
		{isSignUp ? 'Already have an account?' : "Don't have an account?"}
		<button
			type="button"
			onclick={() => (isSignUp = !isSignUp)}
			class="text-[#0071e3] hover:underline"
		>
			{isSignUp ? 'Sign in' : 'Create one'}
		</button>
	</p>
</div>
