<script lang="ts">
	import BottomSheet from '@/components/BottomSheet.svelte';
	import Flex from '@/components/Flex.svelte';
	import Notfound from '@/modules/matchup/components/Notfound.svelte';
	import PlayersCardInfo from '@/modules/matchup/components/PlayersCardInfo.svelte';
	import type { Player } from '@/types/matchup';
	import { cn } from '@/utils';
	import { MoveLeft, MoveRight, X } from 'lucide-svelte';
	import { afterUpdate } from 'svelte';
	import VersusOverview from './VersusOverview.svelte';
	import PlayerProfile from './stats/PlayerProfile.svelte';
	import { pictcherStats, players, teams, comparisonHighlights } from '@/data/matchup';
	import { fly, slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import ComparisonOverview from './comparison-highlights/ComparisonOverview.svelte';
	import ComparisonSlide from './comparison-highlights/ComparisonSlide.svelte';

	let currentSlideIndex = 0;
	let slideDirection = 1;

	const slideOptions = {
		duration: 300,
		easing: quintOut
	};

	const player1Info = {
		player: players[74],
		stats: pictcherStats[0],
		team: teams[Math.floor(Math.random() * teams.length)]
	};
	const player2Info = {
		player: players[75],
		stats: pictcherStats[0],
		team: teams[Math.floor(Math.random() * teams.length)]
	};

	function handleNext() {
		slideDirection = 1;
		currentSlideIndex++;
	}

	function handlePrev() {
		slideDirection = -1;
		currentSlideIndex--;
	}

	$: currentSlideIndex = 4;
</script>

<BottomSheet
	showHeader={false}
	isOpen={true}
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
							onClose={() => {}}
							challenger={player1Info.player}
							opponent={player2Info.player}
						/>
					{:else if currentSlideIndex === 1}
						<PlayerProfile
							playerInfo={player2Info.player}
							playerStats={player2Info.stats}
							teamInfo={player2Info.team}
						/>
					{:else if currentSlideIndex === 2}
						<PlayerProfile
							playerInfo={player1Info.player}
							playerStats={player1Info.stats}
							teamInfo={player1Info.team}
						/>
					{:else if currentSlideIndex === 3}
						<ComparisonOverview challenger={player1Info.player} opponent={player2Info.player} />
					{:else if currentSlideIndex === 4}
						<ComparisonSlide
							challenger={player1Info.player}
							opponent={player2Info.player}
							slide={comparisonHighlights.slides[0]}
							goBack={() => {
								handlePrev();
							}}
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
