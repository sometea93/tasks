import { writable } from 'svelte/store';
import type { Session, User } from '@supabase/supabase-js';

interface AuthState {
	session: Session | null;
	user: User | null;
	loading: boolean;
}

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>({
		session: null,
		user: null,
		loading: true
	});

	return {
		subscribe,
		setSession: (session: Session | null, user: User | null) => {
			set({ session, user, loading: false });
		},
		setLoading: (loading: boolean) => {
			update((state) => ({ ...state, loading }));
		},
		clear: () => {
			set({ session: null, user: null, loading: false });
		}
	};
}

export const authStore = createAuthStore();
