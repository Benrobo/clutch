<script lang="ts">
	import Flex from '@/components/Flex.svelte';
	import SplashScreen from './SplashScreen.svelte';
	import GameArea from './GameArea.svelte';
	import { fade } from 'svelte/transition';
	import { cn, extractAxiosResponseData } from '@/utils';
	import { goto } from '$app/navigation';
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import { getGameLevelChallenges, joinGame } from '@/http/requests';
	import type { FourPicOneWordChallenge } from '@/types/dugout';
	import { useLocalStorage } from '@/hooks/useLocalStorage';
	import { onMount } from 'svelte';
	import { dugoutStore } from '@/store/dugout.store';

	export let slug: string;

	$: gameSession = useLocalStorage<{
		challenges: FourPicOneWordChallenge[];
		hint_points: number;
		current_challenge: FourPicOneWordChallenge | null;
		level: string;
	}>('4-pic-1-word', {
		challenges: [],
		hint_points: 10,
		current_challenge: null,
		level: 'level 1'
	});

	$: showSplashScreen = true;
	$: showGameArea = false;

	$: getGameChallenges = createQuery({
		queryKey: ['game-challenges', slug],
		queryFn: () => getGameLevelChallenges(slug)
	});

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

	const onHideSplashScreen = () => {};

	$: {
		if (!showSplashScreen) {
			setTimeout(() => {
				showGameArea = true;
			}, 500);
		}

		// game challenges
		if ($getGameChallenges.data) {
			const data = extractAxiosResponseData($getGameChallenges.data, 'success')
				?.data as unknown as FourPicOneWordChallenge[];
			// save to local storage
			const sortByCompleted = data?.sort((a: any, b: any) => a?.completed - b?.completed);
			const currentLevel = sortByCompleted[0]?.id;
			const filteredNonCompletedChallenges = $gameSession.challenges.filter(
				(challenge) => !challenge.completed
			);
			const shuffledChallenges = filteredNonCompletedChallenges.sort(() => Math.random() - 0.5);
			gameSession.update((prev) => ({
				...prev,
				challenges: data,
				hint_points: $gameSession?.hint_points,
				current_challenge: $gameSession?.current_challenge ?? shuffledChallenges[0],
				level: currentLevel ? `level ${currentLevel}` : 'level 1'
			}));
		}
	}

	const onLeaveGame = () => {
		showSplashScreen = true;
		showGameArea = false;
		setTimeout(() => {
			goto('/home/dugout');
		}, 1000);
	};

	onMount(() => {
		const storedSession = localStorage.getItem('user-game-level');
		if (storedSession) {
			dugoutStore.setUserGameLevelSession(JSON.parse(storedSession));
		}
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
					$joinGameMut.mutate(slug);
				}}
				loading={$joinGameMut.isPending || $getGameChallenges.isLoading}
			/>
		</div>
	{/if}

	{#if showGameArea}
		<GameArea leaveGame={onLeaveGame} {slug} />
	{/if}
</div>

<style>
</style>
