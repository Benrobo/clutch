<script lang="ts">
	import { goto } from '$app/navigation';
	import Flex from '@/components/Flex.svelte';
	import { DugoutGames } from '@/data/dugout';
	import GameCard from '@/modules/dugout/components/GameCard.svelte';
	import { authStore } from '@/store/auth.store';
	import { useGlobalStore } from '@/store/global.store';
	import { CloudLightning, Zap } from 'lucide-svelte';

	$: globalStore = useGlobalStore();

	const games = DugoutGames;
</script>

<Flex
	className="w-full h-screen relative flex flex-col items-start justify-start gap-4 overflow-hidden bg-dark-103"
>
	<div
		class="w-[300px] h-[300px] rounded-full absolute bottom-10 flex-center backdrop-blur-sm bg-white-400/60 blur-[400px] z-[10]"
	/>

	<!-- header info -->
	<Flex
		className="w-full min-h-[50vh] flex flex-col items-center justify-center gap-2 relative z-[99]"
	>
		<div class="w-full min-h-[15em] absolute top-0 left-0">
			<div
				class="w-full h-[33em] -translate-y-[14em] rounded-b-full scale-[1.3] grayscale opacity-50 object-bottom"
				style={`background-image: url('/pattern-2.jpg');`}
			></div>
		</div>

		<Flex
			className="w-full h-auto flex-row items-end justify-between relative top-[4em] min-h-[20em] px-10"
		>
			<!-- level up name -->
			<Flex className="w-auto h-auto flex-row items-center justify-end">
				<button
					class="px-1 pr-3 py-1 rounded-full flex gap-2 flex-center bg-white-100/10 border-[1px] border-white-400/30"
				>
					<span class="w-[30px] h-[30px] rounded-full bg-yellow-200/10 flex-center">
						<!-- <Zap size={15} class="" /> -->
						<!-- 💎 -->
						👑
					</span>
					<span class="font-jetbrains text-xs text-white-200"> Expert </span>
				</button>
			</Flex>
			<Flex className="w-auto h-auto flex-col items-center justify-center -translate-y-[1em]">
				<div class="w-[150px] h-[150px] p-3 rounded-full bg-white-100/10">
					<img src={$authStore?.user?.avatar} class="w-full h-full rounded-full" alt="" />
				</div>
				<span
					class="text-[1.5em] font-brunoace font-semibold bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-red-302"
				>
					{$authStore?.user?.name ?? '---'}
				</span>
			</Flex>
			<Flex className="w-auto h-auto flex-row items-center justify-end">
				<!-- total points -->
				<button
					class="px-1 pr-3 py-1 rounded-full flex gap-2 flex-center bg-white-100/10 border-[1px] border-white-400/30"
				>
					<span class="w-[30px] h-[30px] rounded-full bg-yellow-200/10 flex-center">
						<!-- <Zap size={15} class="" /> -->
						⭐️
					</span>
					<span class="font-jetbrains text-xs font-semibold text-white-200">3000</span>
				</button>
			</Flex>
		</Flex>
	</Flex>

	<!-- available playable games -->
	<Flex className="w-full h-auto flex flex-col px-10 mt-10 z-[99]">
		<!-- header -->
		<Flex className="w-full h-auto flex flex-col gap-1">
			<h1 class="text-white-100 font-brunoace font-semibold text-lg">Dugout Games</h1>
			<p class="text-white-300 font-poppins font-light text-sm">
				Hit a Home Run with Fun Games That Teach You Baseball Lingo!
			</p>
		</Flex>

		<br />

		<!-- game cards -->
		<Flex
			className="w-full h-auto flex flex-row gap-3 pb-4 overflow-x-scroll whitespace-nowrap hideScrollBar2"
		>
			{#each games as game}
				<GameCard
					{game}
					onClick={() => {
						if (game.available) {
							goto(`/home/dugout/${game.id}`);
						}
					}}
				/>
			{/each}
		</Flex>
	</Flex>
</Flex>
