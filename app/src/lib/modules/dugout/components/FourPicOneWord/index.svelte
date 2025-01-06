<script lang="ts">
	import Flex from '@/components/Flex.svelte';
	import SplashScreen from './SplashScreen.svelte';
	import GameArea from './GameArea.svelte';
	import { fade } from 'svelte/transition';
	import { cn, extractAxiosResponseData } from '@/utils';
	import { goto } from '$app/navigation';
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import { getGameLevelChallenges, joinGame } from '@/http/requests';
	import type { FourPicOneWordChallenge, FourPicOneWordGameSession } from '@/types/dugout';
	import { useLocalStorage } from '@/hooks/useLocalStorage';
	import { onMount } from 'svelte';
	import { dugoutStore, useDugoutStore } from '@/store/dugout.store';

	export let slug: string;

	$: gameSession = useLocalStorage<FourPicOneWordGameSession>('4-pic-1-word', {
		challenges: [],
		hint_points: 10,
		current_challenge: null,
		level: 'level 1'
	});

	let joinedGames: string[] = $dugoutStore?.joinedGames ?? [];

	$: showSplashScreen = true;
	$: showGameArea = false;

	$: getGameChallenges = createQuery({
		queryKey: ['game-challenges', slug],
		queryFn: () => getGameLevelChallenges(slug),
		enabled: joinedGames.includes(slug)
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
			const sortByCompleted = data?.sort((a: any, b: any) => a?.completed - b?.completed);
			const currentLevel = sortByCompleted[0]?.id;

			// Get current challenge ID from session
			const currentChallengeId = $gameSession?.current_challenge?.id;

			// If current challenge exists in new data and is completed, select next challenge
			const shouldSelectNewChallenge =
				currentChallengeId && data.find((c) => c.id === currentChallengeId)?.completed;

			if (shouldSelectNewChallenge) {
				// Filter non-completed challenges from new data
				const filteredNonCompletedChallenges = data.filter((challenge) => !challenge.completed);
				const shuffledChallenges = filteredNonCompletedChallenges.sort(() => Math.random() - 0.5);

				gameSession.update((prev) => ({
					...prev,
					challenges: data,
					hint_points: prev.hint_points,
					current_challenge: shuffledChallenges[0],
					level: currentLevel ? `level ${currentLevel}` : 'level 1'
				}));
			} else {
				// Keep current challenge if it exists and isn't completed
				gameSession.update((prev) => ({
					...prev,
					challenges: data,
					hint_points: prev.hint_points,
					current_challenge: prev.current_challenge ?? sortByCompleted[0],
					level: currentLevel ? `level ${currentLevel}` : 'level 1'
				}));
			}
		}
	}

	const onLeaveGame = () => {
		showSplashScreen = true;
		showGameArea = false;
		setTimeout(() => {
			goto('/home/dugout');
		}, 10);
	};

	onMount(() => {
		const storedSession = localStorage.getItem('user-game-level');
		if (storedSession) {
			dugoutStore.setUserGameLevelSession(JSON.parse(storedSession));
		}

		const storedJoinedGames = localStorage.getItem('joined-games');
		if (storedJoinedGames) {
			joinedGames = JSON.parse(storedJoinedGames);
			showSplashScreen = false;
			showGameArea = true;
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
					if (joinedGames.includes(slug)) {
						showGameArea = true;
					} else {
						$joinGameMut.mutate(slug);
					}
				}}
				loading={$joinGameMut.isPending || $getGameChallenges.isLoading}
			/>
		</div>
	{/if}

	{#if showGameArea}
		<GameArea
			leaveGame={onLeaveGame}
			{slug}
			gameSession={$gameSession}
			currentChallenge={$gameSession.current_challenge}
		/>
	{/if}
</div>

<style>
</style>
