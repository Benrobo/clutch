<script lang="ts">
	import { afterUpdate, onMount } from 'svelte';
	import { getLoggedInUser, logout } from '@/http/requests';
	import { authStore } from '@/store/auth.store';
	import type { BaseResponse } from '@/types';
	import { goto } from '$app/navigation';
	import Spinner from './Spinner.svelte';
	import { createMutation } from '@tanstack/svelte-query';
	import { page } from '$app/stores';
	import { logoutClient } from '@/utils';
	import toast from 'svelte-french-toast';

	$: initialLoading = true;

	const userMut = createMutation({
		mutationFn: async () => await getLoggedInUser(),
		onSuccess: (data) => {
			initialLoading = false;
			authStore.update((state) => ({
				...state,
				user: data.data,
				isLoading: false
			}));

			const homePagePaths = ['/', '/app'];
			if (homePagePaths.includes($page.url.pathname)) {
				goto('/home/feed');
			}
		},
		onError: async (error: any) => {
			initialLoading = false;
			const err = error?.response?.data as BaseResponse<null>;
			const homePagePaths = ['/', '/app'];
			if (
				(!homePagePaths.includes($page.url.pathname) && err?.message === 'Unauthorized') ||
				err?.message === 'INTERNAL SERVER ERROR'
			) {
				toast.error('Something went wrong.');
				await logoutClient();
			}
		}
	});

	onMount(() => {
		$userMut.mutate();
	});
</script>

{#if $userMut.isPending || initialLoading}
	<div
		class="w-screen bg-dark-103 flex items-center justify-center h-screen fixed top-0 left-0 z-50"
	>
		<Spinner size={'20'} />
	</div>
{:else}
	<slot />
{/if}
