<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Flex from '@/components/Flex.svelte';
	import { authStore } from '@/store/auth.store';
	import { cn } from '@/utils';
	import { BellRing, GalleryHorizontal, Lightbulb } from 'lucide-svelte';
	import Gamepad_2 from 'lucide-svelte/icons/gamepad-2';
	import { afterUpdate, onMount } from 'svelte';
	import { derived } from 'svelte/store';
	import type { User } from '@/types/auth';
	import { useGlobalStore } from '@/store/global.store';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	$: pathname = derived(page, ($page) => $page.url.pathname);
	$: slug = $pathname.split('/');
	let activeTab: string | null;
	$: activeTab = slug[slug.length - 1] ?? 'discover';

	$: userDetails = $authStore?.user as User;

	$: globalStore = useGlobalStore();

	const tabs = [
		{
			id: 'feed',
			title: 'Discover',
			href: '/home/feed'
		},
		{
			id: 'spotlight',
			title: 'Spotlight',
			href: '/home/spotlight'
		},
		{
			id: 'activities',
			title: 'Activities',
			href: '/home/activities'
		},
		{
			id: 'dugout',
			title: 'Dugout',
			href: '/home/dugout'
		},
		{
			id: 'profile',
			title: 'Profile',
			href: '/home/profile'
		}
	];

	$: {
		if (activeTab === 'dugout') {
			globalStore.toggleBottomNav(false);
		} else {
			globalStore.toggleBottomNav(true);
		}
	}

	afterUpdate(() => {});
</script>

{#if $globalStore?.hideBottomNav}
	<nav
		class={cn('fixed bottom-0 left-0 right-0 z-[1] bg-dark-103 pb-safe')}
		transition:fly={{ y: 500, duration: 500, easing: quintOut }}
	>
		<div class="max-w-[678px] mx-auto">
			<Flex className="w-full py-3 border-t-[1px] border-t-gray-100">
				{#each tabs as tab}
					<button
						class={cn(
							'w-full transition-all flex flex-col items-center justify-center gap-1 text-white-100 enableBounceEffect',
							activeTab === tab.id && 'text-red-302'
						)}
						on:click={() => {
							goto(tab.href);
						}}
					>
						{#if tab.id === 'feed'}
							<GalleryHorizontal
								size={20}
								class={cn('stroke-white-100', activeTab === tab.id && 'stroke-red-302')}
							/>
						{:else if tab.id === 'spotlight'}
							<Lightbulb
								size={20}
								class={cn('stroke-white-100', activeTab === tab.id && 'stroke-red-302')}
							/>
						{:else if tab.id === 'activities'}
							<BellRing
								size={20}
								class={cn('stroke-white-100', activeTab === tab.id && 'stroke-red-302')}
							/>
						{:else if tab.id === 'dugout'}
							<Gamepad_2
								size={20}
								class={cn('stroke-white-100', activeTab === tab.id && 'stroke-red-302')}
							/>
						{:else if tab.id === 'profile'}
							<img
								src={userDetails?.avatar}
								alt=""
								class="w-[22px] h-[22px] rounded-full"
								on:error={(e) => {
									// @ts-expect-error
									e.currentTarget.src = '/baseball.png';
								}}
							/>
						{:else}
							{null}
						{/if}

						{#if tab.title}
							<span
								class={cn(
									'font-montserrat text-xs font-normal',
									activeTab === tab.id && 'text-red-302'
								)}>{tab.title}</span
							>
						{/if}
					</button>
				{/each}
			</Flex>
		</div>
	</nav>
{/if}

<style>
	nav {
		padding-bottom: env(safe-area-inset-bottom);
	}
</style>
