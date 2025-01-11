<script lang="ts">
	import BottomSheet from '@/components/BottomSheet.svelte';
	import Flex from '@/components/Flex.svelte';
	import Input from '@/components/ui/input.svelte';
	import { GAME_SEASONS } from '@/constant/matchup';
	import { players, teams } from '@/data/matchup';
	import { MLB_PLAYER_POSITIONS } from '@/constant/mlb';
	import ConfigureMatchup from '@/modules/matchup/components/ConfigureMatchup.svelte';
	import Notfound from '@/modules/matchup/components/Notfound.svelte';
	import PlayersCardInfo from '@/modules/matchup/components/PlayersCardInfo.svelte';
	import SelectedMatchup from '@/modules/matchup/components/SelectedMatchup.svelte';
	import type { Player } from '@/types/matchup';
	import { cn } from '@/utils';
	import { BadgeCheck, CheckCheck, ListFilter, Scale, Search, X } from 'lucide-svelte';
	import { afterUpdate } from 'svelte';

	let selectedTeam: number = teams[0]?.id;
	let showSearchFilter = false;

	let selectedPlayers: Player[] = [];
	$: selectedPlayers = [];

	let filters: {
		season: string;
		position: string;
	};
	$: filters = {
		season: '2024',
		position: 'P'
	};

	let selectedMatchup: string | null = null;
	$: selectedMatchup = '123';
	// $: selectedMatchup = null;

	let showConfigureMatchup = false;

	$: seasonValue = '2024';
	$: positionValue = 'P';

	$: filteredPlayers = players.filter((player) => {
		return player.position === filters.position;
	});

	afterUpdate(() => {
		// console.log(selectedPlayers);
	});
</script>

<div class="w-full h-screen mx-auto flex flex-col items-center justify-center bg-dark-103">
	<div class="w-full h-full max-w-[678px] mx-auto relative">
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
			{#if showConfigureMatchup}
				<Flex className="w-full justify-between mt-2">
					<div
						class="w-full h-full max-h-[50px] bg-none rounded-lg flex items-center justify-center"
					>
						<Search size={25} strokeWidth={3} class="stroke-white-100" />
						<input
							type="text"
							class="w-full h-full text-lg bg-transparent outline-none border-none placeholder:text-white-100 text-white-100 font-bold font-gothic-one focus:ring-0 placeholder:text-white-100/50"
							placeholder="Search Players"
						/>
					</div>
					<button
						class={cn(
							'flex-center w-[45px] h-[42px] p-2 bg-none border-[1px] border-white-200/20 rounded-lg relative',
							false ? 'bg-orange-103' : ''
						)}
						on:click={() => {
							showSearchFilter = true;
						}}
					>
						<ListFilter size={20} class="stroke-white-100" />

						<!-- filter indicator -->
						{#if filters.season !== '2024' || filters.position !== 'pitcher'}
							<span
								class="w-4 h-4 text-[10px] rounded-full bg-orange-101 absolute top-0 -translate-y-1 translate-x-1 right-0 flex items-center justify-center"
							>
								{Object.entries(filters).length}
							</span>
						{/if}
					</button>

					<button
						class={cn(
							'flex-center w-[45px] h-[42px] p-2 bg-none border-[1px] border-white-200/20 rounded-lg relative'
						)}
						on:click={() => {
							showConfigureMatchup = false;
						}}
					>
						<X size={20} class="stroke-white-100" />
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

		{#if showConfigureMatchup}
			<div class="h-screen -translate-y-10">
				<ConfigureMatchup
					players={filteredPlayers}
					{selectedPlayers}
					onSelectPlayer={(player) => {
						const isMax = selectedPlayers.length === 2;
						const idExists = selectedPlayers.find((p) => p.id === player?.id);
						if (isMax && !idExists) return;

						if (idExists) {
							selectedPlayers = selectedPlayers.filter((p) => p.id !== player?.id);
						} else {
							selectedPlayers = [...selectedPlayers, player];
						}
					}}
					removeSelectedPlayer={(player) => {
						selectedPlayers = selectedPlayers.filter((p) => p.id !== player?.id);
					}}
					{selectedTeam}
				/>
			</div>

			<div
				class="w-full h-[100px] flex flex-col items-center justify-center gap-2 absolute left-0 right-0 bottom-0 z-[10] bg-gradient-to-t from-dark-103 to-transparent px-10"
			>
				<button
					class={cn(
						'w-full max-w-[300px] h-auto  rounded-full px-4 py-3 text-lg font-semibold font-gothic-one enableBounceEffect disabled:cursor-not-allowed',
						selectedPlayers.length === 2
							? 'bg-orange-101 text-white-100'
							: 'bg-dark-106 text-white-100 text-white-100/50'
					)}
					disabled={selectedPlayers.length !== 2}
				>
					Finalize Lineup
				</button>
			</div>
		{/if}

		{#if !selectedMatchup}
			<!-- show recent matchup lists -->
		{/if}

		<!-- empty state when no players are found or no recent matchup -->
		<Notfound
			title="No recent matchups found"
			description="Start a new matchup by searching for a player."
			showCTA={true}
			ctaClassName="py-2"
			ctaText="Compare Players"
			onClick={() => {
				showConfigureMatchup = true;
			}}
		/>
	</div>
</div>

{#if selectedMatchup}
	<SelectedMatchup />
{/if}

<!-- Search Filter Bottom Sheet -->
<BottomSheet
	className="w-full h-auto min-h-[30vh] bg-dark-106"
	showBackdrop={true}
	isOpen={showSearchFilter}
	showCloseButton={true}
	closeBtnClassName="bg-dark-100/30 text-white-100 stroke-white-100"
	closeBtnIconClassName="stroke-white-100"
	showDragHandle={false}
	onClose={() => {
		showSearchFilter = false;
	}}
>
	<Flex className="w-full h-auto flex flex-col gap-2 px-[4em]">
		<!-- <h1 class="text-white-100 text-xl font-semibold">Search Filter</h1> -->
		<Flex className="w-full h-auto flex flex-row items-center justify-between gap-2 py-2">
			<p class="text-white-100 text-sm font-normal">Seasons</p>
			<select
				name=""
				id=""
				class="w-full h-full bg-dark-100/30 outline-none border-none ring-0 rounded-lg focus:ring-0 cursor-pointer"
				value={seasonValue}
				on:change={(e) => {
					// @ts-expect-error
					seasonValue = e.target?.value;
				}}
			>
				{#each GAME_SEASONS as season}
					<option value={season?.value}>{season?.label}</option>
				{/each}
			</select>
		</Flex>

		<Flex className="w-full h-full flex flex-row items-center justify-between gap-2 py-2">
			<p class="text-white-100 text-sm font-normal">Positions</p>
			<select
				name=""
				id=""
				class="w-full h-full bg-dark-100/30 outline-none border-none ring-0 rounded-lg focus:ring-0 cursor-pointer"
				value={positionValue}
				on:change={(e) => {
					// @ts-expect-error
					positionValue = e.target?.value;
				}}
			>
				{#each MLB_PLAYER_POSITIONS as position}
					<option value={position?.abbrev}>{position?.shortName}</option>
				{/each}
			</select>
		</Flex>

		<br />
		<Flex className="w-full flex-center">
			<button
				class={cn(
					'w-full h-auto bg-orange-101 rounded-full px-4 py-3 text-white-100 text-md font-semibold font-gothic-one enableBounceEffect'
				)}
				on:click={() => {
					showSearchFilter = false;
					filters.season = seasonValue;
					filters.position = positionValue;
				}}
			>
				Apply
			</button>
		</Flex>
	</Flex>
</BottomSheet>
