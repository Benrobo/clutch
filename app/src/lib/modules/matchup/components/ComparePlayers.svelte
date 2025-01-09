<script lang="ts">
	import Flex from '@/components/Flex.svelte';
	import Notfound from '@/modules/matchup/components/Notfound.svelte';
	import PlayersCardInfo from '@/modules/matchup/components/PlayersCardInfo.svelte';
	import type { Player } from '@/types/matchup';
	import { cn } from '@/utils';
	import { X } from 'lucide-svelte';
	import { afterUpdate } from 'svelte';

	export let players: Player[] = [];

	let selectedPlayers: Player[] = [];
	$: selectedPlayers = [];
</script>

{#if players.length > 0}
	<!-- selected players cards -->
	<div class="w-full h-[50px] flex flex-row items-center justify-start mb-5 px-4 md:px-8 gap-2">
		{#each selectedPlayers as player}
			<div
				class="w-auto h-auto bg-orange-101 rounded-full pl-2 py-0 flex flex-row items-center justify-center gap-0"
			>
				<img src={player?.profilePicture} alt={player?.fullName} class="w-5 h-5 rounded-full" />
				<span class="text-white-100 text-sm font-semibold font-recoleta mr-1">
					{player?.fullName}
				</span>
				<button
					class="w-9 h-9 bg-white-100 rounded-full flex flex-center border-none scale-[.80]"
					on:click={() => {
						selectedPlayers = selectedPlayers.filter((p) => p.id !== player?.id);
					}}
				>
					<X size={25} class="stroke-orange-101" strokeWidth={3} />
				</button>
			</div>
		{/each}
	</div>

	<!-- players list -->
	<div
		class="w-full h-full overflow-y-scroll hideScrollBar2 flex flex-col items-start justify-start gap-3 px-4 md:px-8 pb-[20em]"
	>
		<!-- player card -->

		{#each players as player}
			<PlayersCardInfo
				{player}
				onSelect={(player) => {
					const isMax = selectedPlayers.length === 2;
					const idExists = selectedPlayers.find((p) => p.id === player?.id);
					if (isMax && !idExists) return;

					if (idExists) {
						selectedPlayers = selectedPlayers.filter((p) => p.id !== player?.id);
					} else {
						selectedPlayers = [...selectedPlayers, player];
					}
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

<!-- Finalize Lineup -->
<div
	class="w-full h-auto flex flex-col items-center justify-center gap-2 fixed z-[9999] bottom-0 left-0 bg-red-100"
>
	<button
		class="w-full h-auto bg-orange-101 rounded-full px-4 py-2 text-white-100 text-sm font-semibold font-recoleta"
	>
		Finalize Lineup
	</button>
</div>
