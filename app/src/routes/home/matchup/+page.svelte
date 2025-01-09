<script lang="ts">
	import Flex from '@/components/Flex.svelte';
	import Input from '@/components/ui/input.svelte';
	import { players, teams } from '@/data/matchup';
	import ComparePlayers from '@/modules/matchup/components/ComparePlayers.svelte';
	import Notfound from '@/modules/matchup/components/Notfound.svelte';
	import PlayersCardInfo from '@/modules/matchup/components/PlayersCardInfo.svelte';
	import type { Player } from '@/types/matchup';
	import { cn } from '@/utils';
	import { BadgeCheck, CheckCheck, ListFilter, Scale, Search, X } from 'lucide-svelte';
	import { afterUpdate } from 'svelte';

	let selectedTeam: number | null = null;

	let selectedPlayers: Player[] = [];
	$: selectedPlayers = [];

	afterUpdate(() => {
		console.log(selectedPlayers);
	});
</script>

<div class="w-full h-screen mx-auto flex flex-col items-center justify-center bg-dark-103">
	<div class="w-full h-full max-w-[678px] mx-auto">
		<!-- header -->
		<div class="flex flex-col items-center justify-center gap-2 px-4 md:px-8 py-10">
			<Flex className="w-full flex-row items-center py-1">
				<Flex className="w-auto flex-col">
					<Flex className="w-auto flex-row items-center gap-2">
						<Scale size={25} class="stroke-white-100" />
						<h1 class="text-white-200 text-xl font-semibold">Matchup</h1>
					</Flex>
					<p class="text-xs text-white-300">Compare players, stats, and more.</p>
				</Flex>
			</Flex>

			<!-- search bar -->
			{#if true}
				<Flex className="w-full justify-between mt-2">
					<div
						class="w-full h-full max-h-[50px] bg-none rounded-lg flex items-center justify-center"
					>
						<Search size={20} class="stroke-white-100" />
						<input
							type="text"
							class="w-full h-full text-lg bg-transparent outline-none border-none placeholder:text-white-100 text-white-100 font-bold font-recoleta focus:ring-0"
							placeholder="Search Players"
						/>
					</div>
					<button
						class={cn(
							'flex-center w-[45px] h-[42px] p-2 bg-none border-[1px] border-white-200/20 rounded-lg',
							false ? 'bg-orange-103' : ''
						)}
					>
						<ListFilter size={20} class="stroke-white-100" />
					</button>
				</Flex>

				<!-- teams tags -->
				<div
					class="w-full h-auto py-2 flex flex-row gap-4 whitespace-nowrap overflow-x-scroll bg-none mt-5 hideScrollBar2"
				>
					{#each teams as team}
						<button
							class={cn(
								'w-auto h-full flex flex-row items-center justify-around gap-1 py-2 px-4 text-md font-light font-gothic-one rounded-xl border-[1px] border-white-100/10 transition-all ease-in-out',
								selectedTeam === team?.id
									? 'bg-orange-101 text-white-100'
									: 'bg-white-100 text-dark-100'
							)}
							on:click={() => {
								selectedTeam = team?.id;
							}}
						>
							<img src={team?.logo_url} alt={team?.abbreviation} class="w-5 h-5 grayscale" />
							<!-- <span class="text-white-100 text-xl grayscale"> ⚾️ </span> -->
							<!-- {#if selectedTeam === team?.id}
								<span class="text-white-100 text-xl grayscale">
									<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
										><g
											fill="none"
											stroke="currentColor"
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="1.5"
											><path d="M21 12a9 9 0 1 1-18 0a9 9 0 0 1 18 0" /><path
												d="M3.804 9.804c5.022.94 7.697 5.573 6 10.392m10.392-6c-5.022-.94-7.697-5.573-6-10.392"
											/></g
										></svg
									>
								</span>
							{/if} -->
							<span class="ml-2 text-sm mr-3">
								{team?.abbreviation}
							</span>
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<div class="h-screen -translate-y-10">
			<ComparePlayers {players} />
		</div>

		<!-- empty state when no players are found or no recent matchup -->

		<!-- <Notfound
			title="No recent matchups found"
			description="Start a new matchup by searching for a player."
			showCTA={true}
			ctaText="Compare Players"
		/> -->
	</div>
</div>
