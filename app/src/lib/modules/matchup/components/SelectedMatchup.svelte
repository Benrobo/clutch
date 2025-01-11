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
	import PlayerProfile from './PlayerProfile.svelte';
	import { pictcherStats, players, teams } from '@/data/matchup';

	let currentSlideIndex = 0;

	const player1Info = {
		player: players[Math.floor(Math.random() * players.length)],
		stats: pictcherStats[0],
		team: teams[Math.floor(Math.random() * teams.length)]
	};
	const player2Info = {
		player: players[Math.floor(Math.random() * players.length)],
		stats: pictcherStats[0],
		team: teams[Math.floor(Math.random() * teams.length)]
	};

	$: currentSlideIndex = 0;
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
		{/if}

		<Flex
			className="w-full h-auto pb-2 items-center justify-between absolute bottom-2 right-0 px-5"
		>
			<button
				class={cn(
					'w-full max-w-[90px] min-h-[45px] bg-dark-111 flex items-center justify-center rounded-full enableBounceEffect border-[1px] border-white-400/30',
					currentSlideIndex === 0 ? 'invisible' : ''
				)}
				on:click={() => {
					currentSlideIndex -= 1;
				}}
			>
				<MoveLeft size={30} strokeWidth={1} class="stroke-white-200" />
			</button>

			<button
				class="w-full max-w-[90px] min-h-[45px] bg-dark-111 flex items-center justify-center rounded-full enableBounceEffect border-[1px] border-white-400/30"
				on:click={() => {
					currentSlideIndex += 1;
				}}
			>
				<MoveRight size={30} strokeWidth={1} class="stroke-white-200" />
			</button>
		</Flex>
	</div>
</BottomSheet>
