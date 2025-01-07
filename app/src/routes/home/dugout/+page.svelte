<script lang="ts">
	import { goto } from '$app/navigation';
	import Flex from '@/components/Flex.svelte';
	import { DugoutGames } from '@/data/dugout';
	import { useLocalStorage } from '@/hooks/useLocalStorage';
	import { getGameChallenge, getGamesProgress, getUserStats } from '@/http/requests';
	import GameCard from '@/modules/dugout/components/GameCard.svelte';
	import { authStore } from '@/store/auth.store';
	import { useDugoutStore } from '@/store/dugout.store';
	import { useGlobalStore } from '@/store/global.store';
	import type {
		DugoutGameProgress,
		DugoutUserStats,
		FourPicOneWordChallenge
	} from '@/types/dugout';
	import { capitalizeFirstLetter, extractAxiosResponseData } from '@/utils';
	import { createQuery } from '@tanstack/svelte-query';
	import FourPicOneWord from '@/modules/dugout/components/FourPicOneWord/index.svelte';
	import WordSearch from '@/modules/dugout/components/WordSearch/index.svelte';
	import Quiz from '@/modules/dugout/components/Quiz/index.svelte';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	$: globalStore = useGlobalStore();
	$: dugoutStore = useDugoutStore();

	// Get game from query parameter
	$: gameId = $page.url.searchParams.get('game');
	$: currentChallenge = $dugoutStore?.currentGame?.currentChallenge;

	$: userGameLevelSession = useLocalStorage<
		{
			level: string;
			game_id: string;
		}[]
	>('user-game-level', []);

	$: getDugoutGamesProgressQuery = createQuery({
		queryKey: ['dugout-games-progress'],
		queryFn: getGamesProgress
	});

	$: getDugoutUserStatsQuery = createQuery({
		queryKey: ['dugout-user-stats'],
		queryFn: getUserStats
	});

	$: getCurrentChallenge = createQuery({
		queryKey: ['current-challenge', gameId],
		queryFn: () => getGameChallenge(gameId ?? ''),
		enabled: !!gameId
	});

	let gameProgress: DugoutGameProgress[] = [];
	$: gameProgress = [];

	let userStats: DugoutUserStats = {
		highest_level: null,
		stats: []
	};
	$: userStats = {
		highest_level: null,
		stats: []
	};

	$: {
		if ($getDugoutGamesProgressQuery.data) {
			const data = extractAxiosResponseData($getDugoutGamesProgressQuery.data, 'success')
				?.data as unknown as DugoutGameProgress[];
			gameProgress = data;
			userGameLevelSession.update((prev) => {
				const existingGameIds = new Set(prev.map((session) => session.game_id));
				const newSessions = data
					.map((game) => {
						const activeGameSession = $userGameLevelSession.find(
							(session) => session.game_id === game.dugout_game_id
						);
						const gameId = activeGameSession ? activeGameSession.game_id : game.dugout_game_id;
						return {
							game_id: gameId,
							level: game.level
						};
					})
					.filter((session) => !existingGameIds.has(session.game_id));

				return [...prev, ...newSessions];
			});
			const uniqueGameLevels = Array.from(
				new Map(gameProgress.map((game) => [game.dugout_game_id, game.level])).entries()
			).map(([game_id, level]) => ({ game_id, level }));

			dugoutStore.setUserGameLevelSession(uniqueGameLevels);

			dugoutStore.setJoinedGames(gameProgress.map((game) => game.dugout_game_id));

			// save to local storage
			localStorage.setItem(
				'joined-games',
				JSON.stringify(gameProgress.map((game) => game.dugout_game_id))
			);
		}

		if ($getDugoutUserStatsQuery.data) {
			const data = extractAxiosResponseData($getDugoutUserStatsQuery.data, 'success')
				?.data as unknown as DugoutUserStats;
			userStats = data;
		}

		if ($getCurrentChallenge.data) {
			const data = extractAxiosResponseData($getCurrentChallenge.data, 'success')
				?.data as FourPicOneWordChallenge;
			dugoutStore.updateCurrentChallenge(data);
			currentChallenge = data;
		}
	}

	const games = DugoutGames;

	// Update the GameCard click handler
	const handleGameClick = (game: any) => {
		if (game.available) {
			goto(`/home/dugout?game=${game.id}`);
		}
	};

	onMount(() => {
		console.log({ gameId });
	});
</script>

{#if !gameId}
	<Flex
		className="w-full h-screen relative flex flex-col items-start justify-start gap-4 overflow-hidden bg-dark-103"
	>
		<div
			class="w-[300px] h-[300px] rounded-full absolute bottom-10 flex-center backdrop-blur-sm bg-white-400/60 blur-[400px] z-[10]"
		/>

		<!-- header info -->
		<Flex
			className="w-full min-h-[50vh] flex flex-col items-center justify-center gap-2 relative z-[99]"
		>
			<div class="w-full min-h-[15em] absolute top-0 left-0">
				<div
					class="w-full h-[33em] -translate-y-[14em] rounded-b-full scale-[1.3] grayscale opacity-50 object-bottom"
					style={`background-image: url('/pattern-2.jpg');`}
				></div>
			</div>

			<Flex
				className="w-full h-auto flex-row items-end justify-between relative top-[4em] min-h-[20em] px-10"
			>
				<!-- level up name -->
				<Flex className="w-auto h-auto flex-row items-center justify-end">
					<button
						class="px-1 pr-3 py-1 rounded-full flex gap-2 flex-center bg-white-100/10 border-[1px] border-white-400/30"
					>
						<span class="w-[30px] h-[30px] rounded-full bg-yellow-200/10 flex-center">
							{#if userStats?.highest_level === 'apprentice'}
								<span>💎</span>
							{:else if userStats?.highest_level === 'planetary'}
								<span>💠</span>
							{:else if userStats?.highest_level === 'stellar'}
								<span>🌟</span>
							{:else}
								<span>🌌</span>
							{/if}
						</span>
						<span class="font-jetbrains text-xs text-white-200">
							<!-- We need to determine the average level of all the games later -->
							{capitalizeFirstLetter(userStats?.highest_level ?? '---')}
						</span>
					</button>
				</Flex>
				<Flex className="w-auto h-auto flex-col items-center justify-center -translate-y-[1em]">
					<div class="w-[150px] h-[150px] p-3 rounded-full bg-white-100/10">
						<img src={$authStore?.user?.avatar} class="w-full h-full rounded-full" alt="" />
					</div>
					<span
						class="text-[1.5em] font-brunoace font-semibold bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-red-302"
					>
						{$authStore?.user?.name ?? '---'}
					</span>
				</Flex>
				<Flex className="w-auto h-auto flex-row items-center justify-end">
					<!-- total points -->
					<button
						class="px-1 pr-3 py-1 rounded-full flex gap-2 flex-center bg-white-100/10 border-[1px] border-white-400/30"
					>
						<span class="w-[30px] h-[30px] rounded-full bg-yellow-200/10 flex-center"> ⭐️ </span>
						<span class="font-jetbrains text-xs font-semibold text-white-200">
							{userStats?.stats.reduce((acc, curr) => acc + curr.points, 0)}
						</span>
					</button>
				</Flex>
			</Flex>
		</Flex>

		<!-- available playable games -->
		<Flex className="w-full h-auto flex flex-col px-10 mt-10 z-[99]">
			<!-- header -->
			<Flex className="w-full h-auto flex flex-col gap-1">
				<h1 class="text-white-100 font-brunoace font-semibold text-lg">Dugout Games</h1>
				<p class="text-white-300 font-poppins font-light text-sm">
					Hit a Home Run with Fun Games That Teach You Baseball Lingo!
				</p>
			</Flex>

			<br />

			<!-- game cards -->
			<Flex
				className="w-full h-auto flex flex-row gap-3 pb-4 overflow-x-scroll whitespace-nowrap hideScrollBar2"
			>
				{#each games as game}
					<GameCard
						{game}
						gameProgress={gameProgress.find((gp) => gp.dugout_game_id === game.id)}
						onClick={() => handleGameClick(game)}
					/>
				{/each}
			</Flex>
		</Flex>
	</Flex>
{:else}
	<div class="w-screen h-screen">
		{#if gameId === 'word-search'}
			<!-- <WordSearch /> -->
		{:else if gameId === 'quiz'}
			<!-- <Quiz /> -->
		{:else if gameId === '4-pic-1-word'}
			<FourPicOneWord slug={gameId} isLoading={$getCurrentChallenge.isLoading} {currentChallenge} />
		{/if}
	</div>
{/if}
