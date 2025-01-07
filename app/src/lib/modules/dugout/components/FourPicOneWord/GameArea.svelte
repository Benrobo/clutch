<script lang="ts">
	import Flex from '@/components/Flex.svelte';
	import { cn, extractAxiosResponseData } from '@/utils';
	import ThreeDButton from '../ThreeDButton.svelte';
	import { Star, X } from 'lucide-svelte';
	import GameControl from './GameControl.svelte';
	import type { FourPicOneWordGameSession, FourPicOneWordChallenge } from '@/types/dugout';
	import { getUserPointsByGameId } from '@/http/requests';
	import { createQuery } from '@tanstack/svelte-query';
	import { dugoutStore } from '@/store/dugout.store';
	import { onMount } from 'svelte';

	export let slug: string = '';
	export let gameLevel: string = '';
	export let currentChallenge: FourPicOneWordChallenge | null = null;
	export let leaveGame: () => void = () => {};

	$: getGamePointsQuery = createQuery({
		queryKey: ['get-game-points', slug],
		queryFn: () => getUserPointsByGameId(slug)
	});

	let gamePoints: string | number = 0;

	$: {
		if ($getGamePointsQuery.data) {
			const data = extractAxiosResponseData($getGamePointsQuery.data, 'success')
				?.data as unknown as { points: number };
			if (data) {
				gamePoints = data.points;
			}
		}
	}

	// $: currentChallenge = $dugoutStore?.currentGame?.currentChallenge;

	onMount(() => {
		console.log({ currentChallenge });
	});
</script>

<div
	class={cn(
		'w-full h-screen flex flex-col items-start justify-start max-w-[678px] mx-auto transition-all duration-1000 bg-[#302c51] fixed'
	)}
>
	<!-- header -->
	<div
		class="w-full h-auto min-h-[100px] flex justify-end items-end bg-gradient-to-b from-[#5B3A76] from-83% to-[#533971] border-b-[10px] border-b-[#3F2F5D]"
	>
		<Flex className="w-full h-full items-center justify-between px-5">
			<Flex className="w-auto h-auto gap-2 items-center">
				<ThreeDButton
					colorType="hotpink"
					className="w-[45px] h-[45px] flex-center rounded-full"
					onClick={leaveGame}
				>
					<X />
				</ThreeDButton>

				<ThreeDButton colorType="pink" className="w-[45px] h-[45px] flex-center rounded-full">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="30"
						height="30"
						viewBox="0 0 24 24"
						class="-translate-y-1"
						><path
							fill="none"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.5"
							d="M15 21H9v-8.4a.6.6 0 0 1 .6-.6h4.8a.6.6 0 0 1 .6.6zm5.4 0H15v-2.9a.6.6 0 0 1 .6-.6h4.8a.6.6 0 0 1 .6.6v2.3a.6.6 0 0 1-.6.6M9 21v-4.9a.6.6 0 0 0-.6-.6H3.6a.6.6 0 0 0-.6.6v4.3a.6.6 0 0 0 .6.6zm1.806-15.887l.909-1.927a.312.312 0 0 1 .57 0l.91 1.927l2.032.311c.261.04.365.376.176.568l-1.47 1.5l.347 2.118c.044.272-.228.48-.462.351l-1.818-1l-1.818 1c-.233.128-.506-.079-.462-.351l.347-2.118l-1.47-1.5c-.19-.192-.085-.528.175-.568z"
						/></svg
					>
				</ThreeDButton>
			</Flex>

			<!-- level -->
			<div class="w-auto h-auto text-white text-2xl font-poppins font-semibold">
				{gameLevel}
			</div>

			<!-- score -->
			<div class="w-auto min-w-[100px] h-auto flex flex-row items-center justify-center relative">
				<ThreeDButton
					className="w-[35px] h-[35px] flex-center rounded-full border-b-[1px] absolute left-0 -translate-x-4"
				>
					<Star class="fill-[#9d390b] stroke-[#9d390b]" stroke-width={1.05} size={20} />
				</ThreeDButton>
				<div
					class="w-full max-w-[20em] min-h-[35px] bg-[#3F2F5D] pl-10 border-[2px] border-[#7b5b96]/50 rounded-r-full flex items-center justify-end pr-6 text-yellow-102"
				>
					<span class="text-white text-sm font-poppins font-semibold">
						{$getGamePointsQuery?.isLoading ? '---' : gamePoints}
					</span>
				</div>
			</div>
		</Flex>
	</div>

	<!-- 4 img container -->
	<div
		class="w-full h-full max-h-[480px] pb-[2em] bg-[#19172a] flex flex-col items-center justify-center p-3 relative border-b-[2px] border-b-[#61488f]"
	>
		<div class="w-full h-full grid grid-cols-2 gap-2">
			{#if currentChallenge}
				{#each currentChallenge?.media as media}
					<div
						class="w-full h-full border-[1px] bg-[#241a35] border-[#533971]/50 rounded-lg overflow-hidden"
					>
						<img
							src={`/assets/${media.url}`}
							alt={media.description}
							class="w-full h-full object-cover"
						/>
					</div>
				{/each}
			{/if}
		</div>

		<!-- definition -->
		<Flex className="w-full h-auto absolute bottom-0 left-0 px-10 -translate-y-0">
			<div
				class="w-full h-auto bg-gradient-to-b from-[#8C85F5] to-[#9472E9] rounded-t-xs p-4 border-t-[4px] border-t-[#EEDFF4]/30 text-center"
			>
				<span class="text-white text-sm font-poppins font-semibold">
					<!-- A statistic measuring how a player's actions impact their team's chance of winning. -->
					{currentChallenge?.definition}
				</span>
			</div>
		</Flex>
	</div>

	<!-- tile display -->
	<!-- <div class="w-full h-full"> -->
	<!-- <TileDisplay secretWord="Game Score" /> -->
	<GameControl
		secretWord={currentChallenge?.secret?.display}
		{gameLevel}
		{currentChallenge}
		{slug}
	/>
	<!-- </div> -->
</div>
