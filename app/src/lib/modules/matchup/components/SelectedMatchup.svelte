<script lang="ts">
	import BottomSheet from '@/components/BottomSheet.svelte';
	import Flex from '@/components/Flex.svelte';
	import Notfound from '@/modules/matchup/components/Notfound.svelte';
	import PlayersCardInfo from '@/modules/matchup/components/PlayersCardInfo.svelte';
	import type { ComparisonHighlights, MatchupListResponse, Player } from '@/types/matchup';
	import { cn } from '@/utils';
	import { MoveLeft, MoveRight, X } from 'lucide-svelte';
	import { afterUpdate, onMount } from 'svelte';
	import VersusOverview from './VersusOverview.svelte';
	import PlayerProfile from './stats/PlayerProfile.svelte';
	import {
		pictcherStats,
		players,
		teams,
		comparisonHighlights,
		playerOfTheDay
	} from '@/data/matchup';
	import { fly, slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import ComparisonOverview from './comparison-highlights/ComparisonOverview.svelte';
	import ComparisonSlide from './comparison-highlights/ComparisonSlide.svelte';
	import PlayerOfTheDay from './comparison-highlights/PlayerOfTheDay.svelte';

	export let onClose: () => void;
	export let isOpen: boolean = false;
	export let selectedMatchup: MatchupListResponse | null = null;

	$: isMounted = false;

	let currentSlideIndex = 0;
	let slideDirection = 1;

	const slideOptions = {
		duration: 300,
		easing: quintOut
	};

	const challengerInfo = {
		player: selectedMatchup?.player_position_stats?.challenger?.info,
		stats: selectedMatchup?.player_position_stats?.challenger?.stats,
		team: selectedMatchup?.player_position_stats?.challenger?.info?.team
	};
	const opponentInfo = {
		player: selectedMatchup?.player_position_stats?.opponent?.info,
		stats: selectedMatchup?.player_position_stats?.opponent?.stats,
		team: selectedMatchup?.player_position_stats?.opponent?.info?.team
	};

	function handleNext() {
		slideDirection = 1;
		currentSlideIndex++;
	}

	function handlePrev() {
		slideDirection = -1;
		currentSlideIndex--;
	}

	function getPlayerOfTheDayComparisonHighlights() {
		return (comparisonHighlights as ComparisonHighlights).slides.find(
			(slide) => slide.players[playerOfTheDay.player.toString()]
		)?.players[playerOfTheDay.player.toString()];
	}

	function handleClose() {
		setTimeout(() => (isMounted = false), 100);
		setTimeout(() => onClose(), 200);
		currentSlideIndex = 0;
	}

	$: currentSlideIndex = 0;

	onMount(() => {
		// delay the mounting of the component to apply the fly transition
		setTimeout(() => {
			isMounted = true;
		}, 100);
	});
</script>

<BottomSheet
	showHeader={false}
	isOpen={isOpen && isMounted}
	showBackdrop={false}
	showCloseButton={false}
	rounded={false}
	showDragHandle={false}
	className="w-full h-[100vh] overflow-hidden bg-dark-109"
	contentClassName="px-0 py-0"
>
	<div class="w-full h-screen relative">
		<div class="relative overflow-hidden">
			{#key currentSlideIndex}
				<div
					class="w-full h-screen"
					in:fly={{ x: 100 * slideDirection, ...slideOptions }}
					out:fly={{ x: -100 * slideDirection, ...slideOptions }}
				>
					{#if currentSlideIndex === 0}
						<VersusOverview
							onClose={handleClose}
							challenger={challengerInfo.player}
							opponent={opponentInfo.player}
						/>
					{:else if currentSlideIndex === 1}
						<PlayerProfile
							playerInfo={opponentInfo.player}
							playerStats={opponentInfo.stats}
							teamInfo={opponentInfo.team}
						/>
					{:else if currentSlideIndex === 2}
						<PlayerProfile
							playerInfo={challengerInfo.player}
							playerStats={challengerInfo.stats}
							teamInfo={challengerInfo.team}
						/>
					{:else if currentSlideIndex === 3}
						<ComparisonOverview challenger={challengerInfo.player} opponent={opponentInfo.player} />
					{:else if currentSlideIndex === 4}
						<ComparisonSlide
							challenger={challengerInfo.player}
							opponent={opponentInfo.player}
							slide={comparisonHighlights.slides[0]}
							back={handlePrev}
							next={handleNext}
						/>
					{:else if currentSlideIndex === 5}
						<ComparisonSlide
							challenger={challengerInfo.player}
							opponent={opponentInfo.player}
							slide={comparisonHighlights.slides[1]}
							back={handlePrev}
							next={handleNext}
							headerClassName="bg-orange-100"
						/>
					{:else if currentSlideIndex === 6}
						<ComparisonSlide
							challenger={challengerInfo.player}
							opponent={opponentInfo.player}
							slide={comparisonHighlights.slides[2]}
							back={handlePrev}
							next={handleNext}
							headerClassName="bg-yellow-102"
						/>
					{:else if currentSlideIndex === 7}
						<PlayerOfTheDay
							player={players.find((player) => player.id === playerOfTheDay.player)}
							reason={playerOfTheDay.reason}
							comparisonHighlights={getPlayerOfTheDayComparisonHighlights()}
							onClose={handleClose}
							back={handlePrev}
						/>
					{/if}
				</div>
			{/key}
		</div>

		{#if currentSlideIndex <= 3}
			<Flex
				className="w-full h-auto pb-2 items-center justify-between absolute bottom-2 right-0 px-5"
			>
				<button
					class={cn(
						'w-full max-w-[90px] min-h-[45px] bg-dark-111 flex items-center justify-center rounded-full enableBounceEffect border-[1px] border-white-400/30',
						currentSlideIndex === 0 ? 'invisible' : ''
					)}
					on:click={handlePrev}
				>
					<MoveLeft size={30} strokeWidth={1} class="stroke-white-200" />
				</button>

				<button
					class="w-full max-w-[90px] min-h-[45px] bg-dark-111 flex items-center justify-center rounded-full enableBounceEffect border-[1px] border-white-400/30"
					on:click={handleNext}
				>
					<MoveRight size={30} strokeWidth={1} class="stroke-white-200" />
				</button>
			</Flex>
		{/if}
	</div>
</BottomSheet>
