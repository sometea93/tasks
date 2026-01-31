import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from '$lib/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TypedSupabaseClient = SupabaseClient<Database, any, any>;

export function createSupabaseClient(
	fetch?: typeof globalThis.fetch,
	cookies?: {
		getAll: () => { name: string; value: string }[];
		setAll: (cookies: { name: string; value: string; options: Record<string, unknown> }[]) => void;
	}
): TypedSupabaseClient {
	if (isBrowser()) {
		return createBrowserClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
			global: { fetch }
		});
	}

	if (!cookies) {
		throw new Error('Cookies are required for server-side Supabase client');
	}

	return createServerClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		global: { fetch },
		cookies: {
			getAll: () => cookies.getAll(),
			setAll: (newCookies: { name: string; value: string; options: Record<string, unknown> }[]) =>
				cookies.setAll(newCookies)
		}
	});
}
