<script lang="ts">
	import { cn } from '@/utils';
	import { BadgeCheck, Component, Diamond, X, Zap } from 'lucide-svelte';
	import Divider from '@/components/Divider.svelte';
	import type { MatchupListResponse, PlayerStats } from '@/types/matchup';
	import Flex from '@/components/Flex.svelte';
	import { MLB_STATS_SCHEMA } from '@/constant/mlb';

	type PlayerDetails = MatchupListResponse['player_position_stats'][
		| 'challenger'
		| 'opponent']['info'];

	export let player: PlayerDetails;
	export let reason: string;
	export let comparisonHighlights: PlayerStats['stats'];
	export let totalGamesPlayed: number = 0;
	export let onClose: () => void;
	export let back: () => void;

	const statOrderedColors = [
		'bg-yellow-102',
		'bg-pink-101',
		'bg-blue-103',
		'bg-orange-300',
		'bg-green-102'
	];

	const getStatsKeyFullName = (key: string) => {
		return MLB_STATS_SCHEMA.find((stat) => stat.key === key)?.title || key;
	};
</script>

<div class="w-full h-full bg-brown-100 flex flex-col items-start justify-start gap-0 p-0 relative">
	<!-- player basic info -->
	<Flex className="w-full h-auto px-3 md:px-5 py-5 items-center justify-between">
		<Flex className="w-auto h-auto items-center justify-center gap-2">
			<h1 class="text-2xl font-medium font-garamond text-dark-100">{player?.name}</h1>
			{#if player?.verified}
				<BadgeCheck class="w-6 h-6 stroke-brown-100 fill-dark-100" />
			{/if}
		</Flex>

		<!-- close button -->
		<Flex className="absolute top-5 right-5 ">
			<button
				class="w-[35px] h-[35px] md:w-[55px] md:h-[55px] border-none outline-none ring-0 flex flex-row items-center justify-center gap-2 enableBounceEffect bg-dark-111 rounded-full"
				on:click={back}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="18"
					height="18"
					viewBox="0 0 24 24"
					class={cn('text-brown-100 -rotate-360')}
					stroke-width={2}
				>
					<path
						fill="none"
						stroke="currentColor"
						d="M8 5c0 .742-.733 1.85-1.475 2.78c-.954 1.2-2.094 2.247-3.401 3.046C2.144 11.425.956 12 0 12m0 0c.956 0 2.145.575 3.124 1.174c1.307.8 2.447 1.847 3.401 3.045C7.267 17.15 8 18.26 8 19m-8-7h24"
					/></svg
				>
				<!-- <span class="text-xs text-dark-100 font-jetbrains">Next</span> -->
			</button>
			<button
				class="w-[35px] h-[35px] md:w-[55px] md:h-[55px] bg-dark-111 rounded-full flex flex-center enableBounceEffect z-[1]"
				on:click={onClose}
			>
				<X size={18} class="stroke-brown-100" strokeWidth={3} />
			</button>
		</Flex>
	</Flex>

	<Flex
		className="w-full h-auto justify-between px-3 md:px-5 py-5 flex-col gap-0 max-w-[70%] mt-[.5em] md:mt-[4em]"
	>
		<span
			class="px-4 py-1 md:py-2 rounded-full bg-dark-100 text-[10px] md:text-xs font-normal font-poppins text-brown-100"
			>Top Performer</span
		>
		<h2 class="w-full text-[3em] md:text-[4em] font-medium font-garamond text-dark-100">
			Player <br /> Of The Day
		</h2>
	</Flex>

	<!-- player image and insight -->
	<div
		class="w-full min-h-[150px] md:min-h-[200px] h-auto flex flex-row items-center justify-start gap-5 px-3 md:px-5 mt-[2em] md:mt-[5em]"
	>
		<div
			class="min-w-[50px] h-[50px] md:min-w-[100px] md:h-[100px] bg-brown-101 rounded-full overflow-hidden"
		>
			<img
				src={player?.profilePicture}
				alt=""
				class="w-[50px] h-[50px] object-cover scale-[.90] translate-y-3"
			/>
		</div>
		<Flex className="w-full h-auto flex-col gap-0">
			<span
				class={cn(
					'text-sm md:text-lg font-medium font-garamond text-dark-100',
					reason?.length > 20 ? 'text-md' : 'text-lg'
				)}
			>
				{reason}
			</span>
			<span
				class="text-sm flex gap-2 items-center justify-center font-bold font-garamond text-dark-100"
			>
				<Divider className="w-[20px] h-[1px] bg-dark-100" /> Clutch
			</span>
		</Flex>
	</div>

	<!-- stats -->
	<Flex className="w-full h-full items-end justify-end flex-col gap-0">
		<!-- games played -->
		<div
			class="w-full h-auto py-4 px-5 bg-orange-300 flex flex-col items-start justify-start relative"
		>
			<h1 class="text-[2em] md:text-[2.5em] font-bold font-garamond text-dark-100">
				{totalGamesPlayed}
			</h1>
			<span class="text-sm md:text-lg font-normal font-garamond text-dark-100">
				Total Games Played
			</span>

			<span class="absolute top-5 right-2">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="40"
					height="40"
					viewBox="0 0 512 512"
					class="text-dark-100/30"
					><path
						fill="currentColor"
						d="M108 200a92 92 0 1 0-92-92a92.1 92.1 0 0 0 92 92m0-152a60 60 0 1 1-60 60a60.07 60.07 0 0 1 60-60m368.937-9.74a76 76 0 0 0-107.48 0l-5.475 5.475a1173 1173 0 0 0-60.93 65.8l-.318.37l-138.829 183.562l-85.357 85.358a38.263 38.263 0 0 0-46.122 60.229l40.52 40.519a38.272 38.272 0 0 0 60.238-46.13l85.24-85.24l179.9-130.76l.841-.654a1171 1171 0 0 0 77.771-71.049a76.09 76.09 0 0 0 .001-107.48m-22.629 84.853a1140 1140 0 0 1-75.23 68.761L197.576 323.8L88.854 432.519l15.572 15.574a6.26 6.26 0 1 1-8.852 8.853l-40.52-40.519a6.26 6.26 0 0 1 8.853-8.854l15.573 15.574L188.1 314.533l139.57-184.541a1140 1140 0 0 1 58.943-63.63l5.475-5.474a44 44 0 1 1 62.225 62.225Z"
					/></svg
				>
			</span>
		</div>
		<!-- OTHER STATS -->
		{#if (comparisonHighlights ?? [])?.length > 0}
			{#each comparisonHighlights ?? [] as stat, index}
				<div
					class={cn(
						'w-full h-auto py-4 px-5 flex flex-col items-start justify-start relative',
						statOrderedColors[index]
					)}
				>
					<h1 class="text-[2em] md:text-[2.5em] font-bold font-garamond text-dark-100">
						{stat.value}
					</h1>
					<span class="text-md md:text-lg font-normal font-garamond text-dark-100">
						{getStatsKeyFullName(stat.key)}
					</span>

					{#if index === 0}
						<Component
							size={40}
							strokeWidth={1}
							class="stroke-dark-100/30 absolute top-5 right-3"
						/>
					{:else if index === 1}
						<Zap size={40} strokeWidth={1} class="stroke-dark-100/30 absolute top-5 right-3" />
					{:else if index === 2}
						<Diamond size={40} strokeWidth={1} class="stroke-dark-100/30 absolute top-5 right-3" />
					{/if}
				</div>
			{/each}
		{/if}
	</Flex>
</div>
