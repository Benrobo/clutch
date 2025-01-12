<script lang="ts">
	import Flex from '@/components/Flex.svelte';
	import { pictcherStats, players, teams, comparisonHighlights } from '@/data/matchup';
	import type { Player } from '@/types/matchup';
	import { cn } from '@/utils';
	import { BadgeCheck, Dumbbell, Minus, MoveLeft, MoveRight, MoveUpRight, X } from 'lucide-svelte';
	import { MLB_STATS_SCHEMA } from '$lib/constant/mlb';
	import Highlighter from '@/highlighter';
	import Divider from '@/components/Divider.svelte';
	import AnalysisCard from './AnalysisCard.svelte';

	export let challenger: Player;
	export let opponent: Player;
	export let slide: (typeof comparisonHighlights.slides)[number];
	export let headerClassName: string = '';
	export let back: () => void;
	export let next: () => void;

	const hasPlayer = (id: number) => {
		return Object.keys(slide?.players || {}).includes(id.toString());
	};
	const getPlayerSlide = (id: number) => {
		return slide?.players[id.toString() as keyof typeof slide.players];
	};

	const getStatsKeyFullName = (key: string) => {
		return MLB_STATS_SCHEMA.find((stat) => stat.key === key)?.title || key;
	};

	const player1 = {
		info: hasPlayer(challenger?.id) ? challenger : opponent,
		slide: getPlayerSlide(challenger?.id) || []
	};
	const player2 = {
		info: hasPlayer(challenger?.id) ? opponent : challenger,
		slide: getPlayerSlide(opponent?.id) || []
	};

	const highlightedSight = new Highlighter({
		text: slide.insight,
		keywords: [opponent.fullName, challenger.fullName].map((name) => ({
			text: name,
			word: name,
			borderStyle: 'dashed',
			style: 'border-bottom',
			borderColor: '#fe5e2a',
			borderWidth: '2px',
			borderRadius: '0px'
		}))
	});

	console.log(player2?.info);
</script>

<div class="w-full h-full bg-dark-109 flex flex-col items-start justify-start gap-0 p-0 relative">
	<!-- header -->
	<Flex
		className={cn(
			'w-full h-auto min-h-[300px] flex-col gap-6 bg-pink-101 px-10 py-10',
			headerClassName
		)}
	>
		<button
			class="w-auto border-none outline-none ring-0 flex flex-row items-center justify-center gap-2 enableBounceEffect"
			on:click={back}
		>
			<MoveLeft size={30} strokeWidth={1.5} class="stroke-dark-100" />
			<span class="text-xs text-dark-100 font-jetbrains">Back</span>
		</button>
		<h1 class="text-[2.5em] leading-none font-semibold font-garamond text-dark-100">
			{slide.title}
		</h1>
		<div class="w-full flex flex-col items-end justify-end text-end">
			<button
				class="w-auto border-none outline-none ring-0 flex flex-row items-center justify-center gap-2 enableBounceEffect"
				on:click={next}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="80"
					height="80"
					viewBox="0 0 24 24"
					class={cn('text-dark-100 -rotate-180')}
				>
					<path
						fill="none"
						stroke="currentColor"
						d="M8 5c0 .742-.733 1.85-1.475 2.78c-.954 1.2-2.094 2.247-3.401 3.046C2.144 11.425.956 12 0 12m0 0c.956 0 2.145.575 3.124 1.174c1.307.8 2.447 1.847 3.401 3.045C7.267 17.15 8 18.26 8 19m-8-7h24"
					/></svg
				>
				<!-- <span class="text-xs text-dark-100 font-jetbrains">Next</span> -->
			</button>
		</div>
	</Flex>
	<Flex
		className="w-full h-full min-h-[200px] flex-col justify-center gap-6 bg-dark-100-2 px-5 py-10"
	>
		<p class="text-[1.3em] sm:text-[1.5em] font-garamond text-white-100">
			{@html highlightedSight.highlight()}
		</p>
	</Flex>
	<Flex className="w-full h-full max-h-[50vh] flex-col justify-end items-end gap-6 px-5 py-10">
		<div class="w-full h-full grid grid-cols-2 gap-3">
			<!-- positive -->
			<AnalysisCard
				headshot={player1?.info?.profilePicture}
				player={{ name: player1?.info?.fullName }}
				stats={player1.slide.stats?.map((stat) => ({
					key: getStatsKeyFullName(stat.key),
					value: stat.value
				}))}
				percentage={player1.slide.visualization.percentage}
				trend={player1.slide.visualization.trend}
				type="positive"
				source={'#'}
			/>

			<!-- negative -->
			<AnalysisCard
				headshot={player2?.info?.profilePicture}
				player={{ name: player2?.info?.fullName }}
				stats={player2.slide.stats?.map((stat) => ({
					key: getStatsKeyFullName(stat.key),
					value: stat.value
				}))}
				percentage={player2.slide.visualization.percentage}
				trend={player2.slide.visualization.trend}
				type="negative"
				source={'#'}
			/>
		</div>
	</Flex>
</div>
