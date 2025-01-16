<script lang="ts">
	import BottomSheet from '@/components/BottomSheet.svelte';
	import Flex from '@/components/Flex.svelte';
	import { GAME_SEASONS } from '@/constant/matchup';
	import { teams } from '@/data/matchup';
	import { MLB_PLAYER_POSITIONS } from '@/constant/mlb';
	import ConfigureMatchup from '@/modules/matchup/components/ConfigureMatchup.svelte';
	import Notfound from '@/modules/matchup/components/Notfound.svelte';
	import SelectedMatchup from '@/modules/matchup/components/SelectedMatchup.svelte';
	import type { MatchupListResponse, Player } from '@/types/matchup';
	import { cn, extractAxiosResponseData } from '@/utils';
	import { ListFilter, Scale, Search, X } from 'lucide-svelte';
	import { afterUpdate } from 'svelte';
	import MatchUpList from '@/modules/matchup/components/MatchUpList.svelte';
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import { createMatchup, getMatchups, getTeamPlayers } from '@/http/requests';
	import toast from 'svelte-french-toast';
	import queryClient from '@/config/tanstack-query';
	import Spinner from '@/components/Spinner.svelte';

	interface SelectedPlayer {
		teamId: number;
		player: Player;
	}

	let selectedPlayers: SelectedPlayer[] = [];
	let selectedTeam: Record<number, number>;
	let showSearchFilter = false;
	let searchQuery: string;
	let selectedMatchup: MatchupListResponse | null = null;
	let showConfigureMatchup = false;
	let matchupList: MatchupListResponse[] = [];

	let createMatchupState: Array<{
		type: 'challenger' | 'opponent';
		teamId: number;
		fetchedPlayers: Player[];
	}>;
	let activeTeamTab: 'challenger' | 'opponent';
	let _activeTeam: number;

	$: activeTeamTab = 'challenger';
	$: _activeTeam = teams[0]?.id;

	$: createMatchupState = [
		{
			type: 'challenger',
			player: null,
			teamId: teams[0]?.id,
			fetchedPlayers: []
		},
		{
			type: 'opponent',
			player: null,
			teamId: teams[1]?.id,
			fetchedPlayers: []
		}
	] as any;

	$: searchQuery = '';
	$: filters = {
		season: '2024',
		position: 'P'
	};
	$: seasonValue = '2024';
	$: positionValue = 'P';

	$: selectedMatchup = null;

	// Simplified queries by using store values
	$: getTeamPlayersQuery = createQuery({
		queryKey: ['team-players', _activeTeam],
		queryFn: () => getTeamPlayers(_activeTeam),
		enabled: showConfigureMatchup,
		staleTime: 1000 * 60 * 5
	});

	$: getMatchupsQuery = createQuery({
		queryKey: ['matchups'],
		queryFn: getMatchups,
		refetchOnMount: true,
		refetchOnWindowFocus: false,
		refetchOnReconnect: true
	});

	$: createMatchupMut = createMutation({
		mutationFn: createMatchup,
		onSuccess: () => {
			showConfigureMatchup = false;
			searchQuery = '';
			filters.season = '2024';
			filters.position = 'P';

			queryClient.invalidateQueries({ queryKey: ['team-players', selectedTeam] });
		},
		onError: (error) => {
			const resp = extractAxiosResponseData(error, 'error')?.message;
			toast.error(resp);
		}
	});

	$: filteredPlayers = filterPlayers(
		createMatchupState.find((state) => state.teamId === _activeTeam)?.fetchedPlayers ?? [],
		searchQuery,
		filters
	);

	$: isMaxSelectedPlayersUpToLimit = () => {
		const state = selectedPlayers.length === 2;
		return state;
	};

	$: matchupList = (
		$getMatchupsQuery.data
			? (extractAxiosResponseData($getMatchupsQuery.data, 'success')?.data ?? [])
			: []
	) as Array<MatchupListResponse>;

	$: {
		if ($getTeamPlayersQuery.data) {
			const data = (extractAxiosResponseData($getTeamPlayersQuery.data, 'success')?.data ??
				[]) as unknown as Player[];
			let updated = createMatchupState.find((state) => state.teamId === _activeTeam);
			if (updated?.fetchedPlayers) {
				updated.fetchedPlayers = [...data];

				// account for duplicate
				createMatchupState = [
					...createMatchupState.filter((state) => state.type !== updated.type),
					updated
				];
			}
		}
	}

	const filterPlayers = (
		players: Player[],
		query: string,
		filters: { season: string; position: string }
	) => {
		return (players ?? []).filter((player) => {
			return query.toLowerCase().length > 0
				? player.fullName.toLowerCase().includes(query.toLowerCase()) &&
						player.position === filters.position
				: player.position === filters.position;
		});
	};

	function handleTeamChange(teamId: number) {
		_activeTeam = teamId;
		activeTeamTab = createMatchupState.find((state) => state.teamId === _activeTeam)?.type! as any;
	}

	function handlePlayerSelection(player: Player) {
		// If player already selected, remove them
		const existingIndex = selectedPlayers.findIndex((selected) => selected.player.id === player.id);
		if (existingIndex >= 0) {
			selectedPlayers = selectedPlayers.filter((_, i) => i !== existingIndex);
			return;
		}

		// Add new player if less than 2 players selected
		if (selectedPlayers.length < 2) {
			selectedPlayers = [
				...selectedPlayers,
				{
					teamId: _activeTeam,
					player
				}
			];
		}
	}

	function handleRemovePlayer(player: Player) {
		selectedPlayers = selectedPlayers.filter((s) => s.player.id !== player.id);
	}

	function handleChallengerAndOpponentChange(teamId: number, type: 'challenger' | 'opponent') {
		if (type === 'challenger') {
			const updatedState = createMatchupState.find((state) => state.type === 'challenger');
			if (updatedState) {
				updatedState.teamId = teamId;
				_activeTeam = teamId;
				activeTeamTab = 'challenger';
				console.log({ updatedState });
				createMatchupState = [
					...createMatchupState.filter((state) => state.type !== 'challenger'),
					updatedState
				];
			}
		} else {
			const updatedState = createMatchupState.find((state) => state.type === 'opponent');
			if (updatedState) {
				updatedState.teamId = teamId;
				_activeTeam = teamId;
				activeTeamTab = 'opponent';
				createMatchupState = [
					...createMatchupState.filter((state) => state.type !== 'opponent'),
					updatedState
				];
			}
		}
	}

	function handleCreateMatchup() {
		if (selectedPlayers.length !== 2) return;

		const [challengerIndex, opponentIndex] = selectedPlayers.map((sp) =>
			createMatchupState.findIndex((cs) => cs.teamId === sp.teamId)
		);

		const challengerPlayer = selectedPlayers[0].player;
		const opponentPlayer = selectedPlayers[1].player;
		const challengerTeam = selectedPlayers[challengerIndex].teamId;
		const opponentTeam = selectedPlayers[opponentIndex].teamId;

		$createMatchupMut.mutate({
			challengerId: challengerPlayer.id,
			opponentId: opponentPlayer.id,
			challengerTeamId: challengerTeam,
			opponentTeamId: opponentTeam,
			position: filters.position,
			season: Number(filters.season)
		});
	}

	afterUpdate(() => {});
</script>

<div class="w-full h-screen mx-auto flex flex-col items-center justify-center bg-dark-103">
	<div class="w-full h-full max-w-[678px] mx-auto relative">
		<!-- header -->
		<div class="flex flex-col items-center justify-center gap-2 px-4 md:px-8 py-10">
			<Flex className="w-full flex-row items-center justify-between py-1">
				<Flex className="w-auto flex-col">
					<Flex className="w-auto flex-row items-center gap-2">
						<Scale size={25} class="stroke-white-100" />
						<h1 class="text-white-200 text-xl font-gothic-one font-semibold">Matchup</h1>
					</Flex>
					<p class="text-xs text-white-300">Compare players, stats, and more.</p>
				</Flex>

				<button
					class={cn(
						'w-auto h-auto text-white-100 rounded-full px-4 py-2 text-sm font-light font-gothic-one enableBounceEffect',
						showConfigureMatchup ? 'bg-dark-106 border-[1px] border-white-400/30' : 'bg-orange-101'
					)}
					on:click={() => {
						showConfigureMatchup = !showConfigureMatchup;
					}}
				>
					{showConfigureMatchup ? 'Cancel' : 'New Matchup'}
				</button>
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
							value={searchQuery}
							on:input={(e) => {
								// @ts-expect-error
								searchQuery = e.target?.value;
							}}
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
								<!-- {Object.entries(filters).length} -->
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
					{#each createMatchupState.sort( (a, b) => (a.type === 'challenger' ? -1 : 1) ) as matchupState}
						{@const team = teams.find((team) => team.id === Number(matchupState.teamId))}
						<button
							class={cn(
								'w-auto h-full flex flex-row items-center justify-around gap-1 py-2 px-4 text-md font-light font-gothic-one rounded-full border-[1px] border-white-100/10 transition-all ease-in-out',
								matchupState.type === activeTeamTab
									? 'bg-orange-101 text-white-100'
									: 'bg-white-100 text-dark-100  disabled:cursor-not-allowed disabled:opacity-50'
							)}
							on:click={() => {
								// @ts-expect-error
								handleTeamChange(team?.id);
							}}
							disabled={$createMatchupMut.isPending}
						>
							<img src={team?.logo_url} alt={team?.abbreviation} class="w-5 h-5 grayscale" />
							<span class="ml-2 text-xs mr-3">
								{team?.name}
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
					selectedPlayers={selectedPlayers.map((s) => s.player)}
					onSelectPlayer={handlePlayerSelection}
					removeSelectedPlayer={handleRemovePlayer}
					isLoading={$getTeamPlayersQuery.isFetching || $getTeamPlayersQuery.isLoading}
					onSelectedPlayersClick={(pId) => {
						const playerTeam = selectedPlayers.find((s) => s.player?.id === pId)?.teamId;
						if (playerTeam) {
							const activeTeam = createMatchupState.find((s) => s.teamId === playerTeam);
							if (activeTeam) {
								activeTeamTab = activeTeam.type;
								_activeTeam = activeTeam.teamId;
							}
						}
					}}
				/>
			</div>

			<div
				class="w-full h-[100px] flex flex-col items-center justify-center gap-2 absolute left-0 right-0 bottom-0 z-[10] bg-gradient-to-t from-dark-103 to-transparent px-10"
			>
				<button
					class={cn(
						'w-full max-w-[300px] h-auto  rounded-full px-4 py-3 text-lg font-semibold font-gothic-one enableBounceEffect disabled:cursor-not-allowed flex-center',
						isMaxSelectedPlayersUpToLimit() && !$createMatchupMut.isPending
							? 'bg-orange-101 text-white-100'
							: 'bg-dark-106 text-white-100 text-white-100/50'
					)}
					disabled={!isMaxSelectedPlayersUpToLimit() || $createMatchupMut.isPending}
					on:click={() => {
						handleCreateMatchup();
					}}
				>
					{#if $createMatchupMut.isPending}
						<Spinner size="20" strokeWidth={'2.5'} />
					{:else}
						Finalize Lineup
					{/if}
				</button>
			</div>
		{/if}

		{#if matchupList.length > 0}
			<MatchUpList
				{matchupList}
				onSelect={(matchup) => {
					selectedMatchup = matchup;
				}}
			/>
		{:else}
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
		{/if}
	</div>
</div>

{#if selectedMatchup}
	<SelectedMatchup
		onClose={() => {
			selectedMatchup = null;
		}}
		isOpen={!!selectedMatchup}
		{selectedMatchup}
	/>
{/if}

<!-- Search Filter Bottom Sheet -->
<BottomSheet
	className="w-full h-auto min-h-[30vh] bg-dark-106"
	showBackdrop={false}
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
		<Flex className="w-full h-auto flex flex-col items-start justify-start gap-2 py-2">
			<p class="text-white-200 text-xs font-normal">Seasons</p>
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

		<Flex className="w-full h-full flex flex-col items-start justify-start gap-2 py-2">
			<p class="text-white-200 text-xs font-normal">Positions</p>
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

		<Flex className="w-full h-full flex flex-col items-start justify-start gap-2 py-2">
			<p class="text-white-200 text-xs font-normal">Challenger Team</p>
			<select
				name="challengerTeam"
				id=""
				class="w-full h-full bg-dark-100/30 outline-none border-none ring-0 rounded-lg focus:ring-0 cursor-pointer"
				value={createMatchupState.find((state) => state.type === 'challenger')?.teamId}
				on:change={(e) => {
					// @ts-expect-error
					handleChallengerAndOpponentChange(Number(e.target?.value), 'challenger');
				}}
			>
				{#each teams as team}
					<option value={team?.id}>{team?.name}</option>
				{/each}
			</select>
		</Flex>

		<Flex className="w-full h-full flex flex-col items-start justify-start gap-2 py-2">
			<p class="text-white-200 text-xs font-normal">Opponent Team</p>
			<select
				name="opponentTeam"
				id=""
				class="w-full h-full bg-dark-100/30 outline-none border-none ring-0 rounded-lg focus:ring-0 cursor-pointer"
				value={createMatchupState.find((state) => state.type === 'opponent')?.teamId}
				on:change={(e) => {
					// @ts-expect-error
					handleChallengerAndOpponentChange(Number(e.target?.value), 'opponent');
				}}
			>
				{#each teams as team}
					<option value={team?.id}>{team?.name}</option>
				{/each}
			</select>
		</Flex>

		<br />
		<!-- <Flex className="w-full flex-center">
			<button
				class={cn(
					'w-full h-auto bg-orange-101 rounded-full px-4 py-3 text-white-100 text-md font-semibold font-gothic-one enableBounceEffect'
				)}
				on:click={() => {
					// if (filters.position !== positionValue) {
					// 	// Find and clear the current selection
					// }
					// if (selectedTeam[selectingFor] !== selectInputTeam[selectingForInput]) {
					// 	// Find and clear the current selection
					// }
					// selectedTeam = selectInputTeam;
					// selectingFor = selectingForInput;
					// showSearchFilter = false;
					// filters.season = seasonValue;
					// filters.position = positionValue;
				}}
			>
				Apply
			</button>
		</Flex> -->
		<br />
	</Flex>
</BottomSheet>
