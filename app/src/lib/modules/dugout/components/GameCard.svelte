<script lang="ts">
	import Flex from '@/components/Flex.svelte';
	import type { GameType } from '@/types/games';
	import { cn } from '@/utils';

	export let game: {
		id: GameType;
		title: string;
		description: string;
		image: string;
		available: boolean;
	} | null = null;
	export let onClick: () => void;
</script>

<button
	class={cn(
		'w-auto min-w-[200px] h-auto enableBounceEffect disabled:cursor-not-allowed disabled:grayscale disabled:opacity-50',
		game?.available ? 'cursor-pointer' : 'cursor-not-allowed grayscale opacity-50'
	)}
	on:click={onClick}
	disabled={!game?.available}
>
	<Flex
		className="w-full max-w-[200px] min-h-[290px] flex justify-between flex-col gap-3 bg-dark-106 cursor-pointer rounded-lg border-[.5px] border-white-400/30"
	>
		<Flex className="w-full h-auto flex-col flex-center p-3">
			<div
				class="w-full h-full min-h-[150px] bg-dark-103/30 rounded-lg flex-center border-[.5px] border-white-400/20"
			>
				<span class="text-white-200 text-4xl">
					{#if game?.id === 'word-search'}
						🔍
					{:else if game?.id === 'quiz'}
						🎲
					{:else if game?.id === '4-pic-one-word'}
						🖼️
					{/if}
				</span>
			</div>
		</Flex>
		<Flex className="w-full h-auto flex-col text-start p-3">
			<h1 class="text-white-100 font-jetbrains font-semibold text-sm">{game?.title}</h1>
			<p class="text-white-300 font-poppins font-light text-wrap text-xs">
				{game?.description}
			</p>
		</Flex>
	</Flex>
</button>
