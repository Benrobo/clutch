<script lang="ts">
	import Flex from '@/components/Flex.svelte';
	import type { MatchupListResponse } from '@/types/matchup';

	type Player = MatchupListResponse['player_position_stats']['challenger']['info'];

	export let challenger: Player;
	export let opponent: Player;
</script>

<div class="w-full h-full bg-dark-110 flex flex-col items-center justify-center p-0 relative">
	<Flex className="w-full h-auto flex-col gap-3 px-8">
		<span
			class="px-5 py-2 text-[12px] rounded-full font-normal font-poppins text-dark-100 bg-pink-101"
		>
			Comparison Highlights
		</span>
		<h1 class="text-[4em] leading-none font-normal font-garamond text-white-100">
			Player Comparison Highlights
		</h1>
		<p class="text-sm font-light font-poppins text-white-200">
			See how
			<span class="font-bold">{challenger.name}</span>
			and
			<span class="font-bold">{opponent.name}</span>
			stack up.
		</p>
	</Flex>
</div>
