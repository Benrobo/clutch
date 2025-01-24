<script lang="ts">
	import Flex from '@/components/Flex.svelte';
	import SplashScreen from './SplashScreen.svelte';
	import GameArea from './GameArea.svelte';
	import { fade } from 'svelte/transition';
	import { cn, extractAxiosResponseData } from '@/utils';
	import { goto } from '$app/navigation';
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import { getGameChallenge, joinGame } from '@/http/requests';
	import type { FourPicOneWordChallenge } from '@/types/dugout';
	import { onMount } from 'svelte';
	import { dugoutStore } from '@/store/dugout.store';

	export let slug: string;
	export let currentChallenge: FourPicOneWordChallenge | null = null;
	export let isLoading: boolean = false;

	let joinedGames: string[] = [];
	let showSplashScreen = true;
	let showGameArea = false;

	$: gameLevel = currentChallenge?.id ? `Level ${currentChallenge?.id}` : 'Level 1';

	$: joinGameMut = createMutation({
		mutationFn: (slug: string) => joinGame(slug),
		onSuccess: () => {
			showSplashScreen = false;
			showGameArea = true;
		},
		onError: () => {
			showSplashScreen = true;
			showGameArea = false;
		}
	});

	const onLeaveGame = () => {
		showSplashScreen = true;
		showGameArea = false;
		setTimeout(() => {
			// delete the game from the query parameter
			goto('/home/dugout', { invalidateAll: true });
		}, 10);
	};

	onMount(() => {
		// const storedJoinedGames = JSON.parse(localStorage.getItem('joined-games') || '[]');
		// joinedGames = storedJoinedGames;
		// if (storedJoinedGames?.includes(slug)) {
		// 	showSplashScreen = false;
		// 	showGameArea = true;
		// }
	});
</script>

<div
	class={cn(
		'w-full h-full flex flex-col items-center justify-center max-w-[678px] mx-auto transition-all duration-1000 relative ',
		!showSplashScreen && 'bg-none duration-500'
	)}
	transition:fade={{ duration: 1000 }}
>
	{#if showSplashScreen}
		<div class="w-full h-auto" transition:fade={{ duration: 500 }}>
			<SplashScreen
				onClick={() => {
					if (joinedGames.includes(slug)) {
						showGameArea = true;
					} else {
						$joinGameMut.mutate(slug);
					}
				}}
				loading={$joinGameMut.isPending || isLoading}
			/>
		</div>
	{/if}

	{#if showGameArea && !isLoading}
		<GameArea leaveGame={onLeaveGame} {slug} {gameLevel} {currentChallenge} />
	{/if}
</div>

<style>
</style>
