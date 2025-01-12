<script lang="ts">
	import { cn } from '@/utils';
	import { BadgeCheck, Minus, MoveUpRight, X } from 'lucide-svelte';
	import Divider from '@/components/Divider.svelte';
	import { scale } from 'svelte/transition';
	import type { Player, PlayerStats } from '@/types/matchup';
	import Flex from '@/components/Flex.svelte';

	export let player: Player | undefined;
	export let reason: string;
	export let comparisonHighlights: PlayerStats | undefined;
	export let onClose: () => void;
</script>

<div class="w-full h-full bg-brown-100 flex flex-col items-start justify-start gap-0 p-0 relative">
	<!-- player basic info -->
	<Flex className="w-full h-auto px-5 py-5 items-center justify-between">
		<Flex className="w-auto h-auto items-center justify-center gap-2">
			<h1 class="text-2xl font-medium font-garamond text-dark-100">{player?.fullName}</h1>
			{#if player?.verified}
				<BadgeCheck class="w-6 h-6 stroke-brown-100 fill-dark-100" />
			{/if}
		</Flex>

		<!-- close button -->
		<button
			class="absolute top-5 right-5 w-[35px] h-[35px] md:w-[55px] md:h-[55px] bg-dark-111 rounded-full flex flex-center enableBounceEffect z-[1]"
			on:click={onClose}
		>
			<X size={18} class="stroke-brown-100" strokeWidth={3} />
		</button>
	</Flex>

	<Flex className="w-full h-auto px-5 py-5 flex-col gap-0 max-w-[70%] mt-[4em]">
		<span class="px-4 py-2 rounded-full bg-dark-100 text-xs font-normal font-poppins text-brown-100"
			>Top Performer</span
		>
		<h2 class="text-[4em] font-medium font-garamond text-dark-100">Player <br /> Of The Day</h2>
	</Flex>

	<!-- player image and insight -->
	<div
		class="w-full min-h-[100px] h-auto flex flex-row items-center justify-start gap-5 px-5 mt-[5em]"
	>
		<div class="min-w-[100px] h-[100px] bg-brown-101 rounded-full overflow-hidden">
			<img
				src={player?.profilePicture}
				alt=""
				class="w-full h-full object-cover scale-[.90] translate-y-3"
			/>
		</div>
		<Flex className="w-full h-auto flex-col gap-0">
			<span
				class={cn(
					'font-medium font-garamond text-dark-100',
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
</div>
