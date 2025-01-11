<script lang="ts">
	import Flex from '@/components/Flex.svelte';
	import { pictcherStats, players, teams } from '@/data/matchup';
	import type { Player } from '@/types/matchup';
	import { cn } from '@/utils';
	import { BadgeCheck, Dumbbell, Minus, X } from 'lucide-svelte';
	import PlayerStatsCard from './stats/PlayerStatsCard.svelte';

	export let playerInfo: Player;
	export let playerStats: (typeof pictcherStats)[0];
	export let teamInfo: (typeof teams)[0];

	let firstNameLetter = playerInfo?.fullName.split(' ')[0][0];
	let lastNameLetter = playerInfo?.fullName.split(' ')[1][0];
</script>

<div class="w-full h-full bg-dark-111 flex flex-col items-center justify-between p-0 relative">
	<!-- player basic info -->
	<div
		class="w-full h-[40vh] flex flex-col items-center justify-center gap-0 relative bg-orange-101- bg-dark-110 rounded-b-[2em]"
	>
		<div
			class="absolute top-[4em] md:top-10 -translate-y-10 flex flex-col items-center justify-center"
		>
			<span class="text-white-100 text-[8em] md:text-[12em] font-facon">
				{firstNameLetter}
				{lastNameLetter}
			</span>
		</div>

		<div
			class="w-full h-full absolute top-[5em] md:top-10 -translate-y-10 flex flex-col items-center justify-center"
		>
			<!-- player image -->
			<div
				class="w-[150px] h-[150px] md:w-[180px] md:h-[180px] bg-dark-111 rounded-full border-[5px] border-orange-102 outline outline-[10px] outline-dark-111/30 shadow-2xl shadow-white-400/30"
			>
				<img
					src={playerInfo?.profilePicture}
					alt=""
					class="w-full h-full rounded-full"
					on:error={(e) => {
						// @ts-expect-error
						e.currentTarget.src = '/baseball.png';
					}}
				/>
			</div>

			<!-- player info -->
			<div
				class="w-full h-auto pt-[1em] md:pt-[3em] flex flex-col items-center justify-center gap-0"
			>
				<span class="text-white-100 text-[1.2em] md:text-[2em] font-facon relative">
					{playerInfo?.fullName}

					{#if playerInfo?.verified}
						<span class="absolute -top-1 -right-4 translate-x-2">
							<BadgeCheck size={20} class="stroke-white-100 fill-orange-101" />
						</span>
					{/if}
				</span>

				<div class="w-full max-w-[70%] flex flex-row items-center justify-center gap-5 py-5">
					<div class="flex flex-row items-center justify-center gap-2">
						<span class="text-white-300 font-poppins text-xs md:text-sm"> Active: </span>

						<div class="flex-center relative">
							<div
								class={cn(
									'w-3 h-3 animate-ping rounded-full',
									playerInfo?.active ? 'bg-green-100' : 'bg-red-305'
								)}
							></div>
							<div
								class={cn(
									'w-2 h-2 rounded-full absolute',
									playerInfo?.active ? 'bg-green-100' : 'bg-red-305'
								)}
							></div>
						</div>
					</div>

					<Minus size={20} class="text-white-300/30 rotate-90" />

					<div class="flex flex-row items-center justify-center gap-2">
						<Dumbbell size={18} class="text-white-400" />

						<span class="text-white-300 font-poppins text-xs md:text-sm text-nowrap">
							{playerInfo?.weight} lbs
						</span>
					</div>

					<Minus size={20} class="text-white-300/30 rotate-90" />

					<div class="flex flex-row items-center justify-center gap-2">
						<!-- player batside -->
						<!-- <span class="text-xl grayscale">🏏</span> -->

						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
							><g
								fill="none"
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.5"
								color="currentColor"
								><path d="M5.46 20L20.556 8.69a3.738 3.738 0 1 0-5.246-5.247L4 18.541" /><path
									d="M5.578 21.843c1.502-2.072-1.332-4.932-3.42-3.418a.38.38 0 0 0-.046.577L5 21.888c.166.166.44.144.578-.045M10 17l-3-3"
								/><circle cx="2.5" cy="2.5" r="2.5" transform="matrix(-1 0 0 1 21 16)" /></g
							></svg
						>

						<span class="text-white-300 font-poppins text-xs md:text-sm">
							<!-- left or right -->
							Right
						</span>
					</div>

					<Minus size={20} class="text-white-300/30 rotate-90" />

					<!-- team logo -->
					<div class="flex flex-row items-end justify-end gap-2">
						<img src={teamInfo?.logo_url} alt="" class="w-5 h-5" />

						<span class="text-white-300 font-poppins text-xs md:text-sm">
							{teamInfo?.name}
						</span>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- player stats -->
	<div
		class="w-full h-full max-h-[calc(100vh-40vh)] flex flex-col items-start justify-start gap-0 relative py-5"
	>
		<Flex className="w-full h-auto px-4">
			<span class="text-white-100 text-[2em] md:text-[2em] font-mouzambik relative"> Stats </span>
		</Flex>

		<div class="w-full h-auto grid grid-cols-2 gap-5 px-4 py-3 overflow-y-auto hideScrollBar2">
			<!-- pitcher stats (some stats within pitcher are available for some positions) -->
			<PlayerStatsCard
				headline="Total Games Played"
				tagline="total games played"
				value={playerStats?.stat?.gamesPlayed}
			/>

			<PlayerStatsCard
				headline="earned run average"
				tagline="measures run prevention"
				value={playerStats?.stat?.era}
			/>

			<PlayerStatsCard
				headline="strikeouts"
				tagline="ability to miss bats"
				value={playerStats?.stat?.strikeOuts}
			/>

			<PlayerStatsCard
				headline="wins"
				tagline="contribution to team success"
				value={playerStats?.stat?.wins}
			/>

			<PlayerStatsCard
				headline="whip"
				tagline="baserunner prevention"
				value={playerStats?.stat?.whip}
			/>

			<PlayerStatsCard
				headline="innings pitched"
				tagline="workload and durability"
				value={playerStats?.stat?.inningsPitched}
			/>

			<PlayerStatsCard
				headline="saves"
				tagline="game-finishing ability"
				value={playerStats?.stat?.saves}
			/>

			<!-- catcher / 1B / 2B / 3B / SS / OF / DH stats -->
		</div>
	</div>
</div>
