<script lang="ts">
	import Flex from '@/components/Flex.svelte';
	import Notfound from '@/modules/matchup/components/Notfound.svelte';
	import PlayersCardInfo from '@/modules/matchup/components/PlayersCardInfo.svelte';
	import type { Player } from '@/types/matchup';
	import { X } from 'lucide-svelte';

	export let players: Player[] = [];
	export let selectedPlayers: Player[] = [];
	export let onSelectPlayer: (player: Player) => void;
	export let removeSelectedPlayer: (player: Player) => void;
	export let isLoading: boolean = false;
	export let onSelectedPlayersClick: (pId: number) => void;
</script>

{#if isLoading}
	<div class="w-full flex flex-col items-center justify-center gap-2 px-4">
		{#each Array(3) as _}
			<div
				class="w-full h-auto min-h-[150px] flex flex-row items-start justify-start py-5 gap-1 relative rounded-2xl bg-dark-106/50 border-[1px] border-white-400/10 overflow-hidden transition-all animate-pulse"
			></div>
		{/each}
	</div>
{:else if players.length > 0}
	<!-- selected players cards -->
	<div class="w-full h-[50px] flex flex-row items-center justify-start mb-5 px-4 md:px-8 gap-2">
		{#if selectedPlayers.length > 0}
			{#each selectedPlayers as player}
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<div
					class="w-auto h-auto bg-orange-101 rounded-full pl-2 py-0 flex flex-row items-center justify-center gap-0 cursor-pointer"
					on:click={() => {
						if (!isLoading) {
							onSelectedPlayersClick(player?.id);
						}
					}}
				>
					<img src={player?.profilePicture} alt={player?.fullName} class="w-5 h-5 rounded-full" />
					<span class="text-white-100 text-sm font-semibold font-garamond mr-1">
						{player?.fullName}
					</span>
					<button
						class="w-9 h-9 bg-white-100 rounded-full flex flex-center border-none scale-[.80]"
						on:click={() => {
							removeSelectedPlayer(player);
						}}
					>
						<X size={25} class="stroke-orange-101" strokeWidth={3} />
					</button>
				</div>
			{/each}
		{:else}
			<Flex className="w-full h-auto flex flex-col items-center justify-center gap-2">
				<span class="text-white-300 text-xs font-light font-poppins">
					Selected players will appear here!
				</span>
			</Flex>
		{/if}
	</div>

	<!-- players list -->
	<div
		class="w-full h-full overflow-y-scroll hideScrollBar2 flex flex-col items-start justify-start gap-3 px-4 md:px-8 pb-[30em]"
	>
		<!-- player card -->

		{#each players as player}
			<PlayersCardInfo
				{player}
				onSelect={(player) => {
					onSelectPlayer(player);
				}}
				{selectedPlayers}
				disabled={selectedPlayers.length === 2 && !selectedPlayers.find((p) => p.id === player?.id)}
			/>
		{/each}
	</div>
{:else}
	<Notfound
		title="No matching results found"
		description="Try searching for a different player."
		showCTA={false}
	/>
{/if}
