<script lang="ts">
	import Flex from '$lib/components/Flex.svelte';
	import type { Player } from '@/types/matchup';
	import { cn } from '@/utils';
	import { BadgeCheck, Check, CheckCheck } from 'lucide-svelte';

	export let player: Player;
	export let selectedPlayers: Player[] = [];
	export let onSelect: (player: Player) => void;
	export let disabled: boolean = false;

	$: isSelected = selectedPlayers.find((p) => p.id === player?.id);
</script>

<div
	class={cn(
		'w-full h-auto min-h-[200px] flex flex-row items-start justify-start py-5 gap-1 relative rounded-2xl bg-dark-102 border-[1px] border-white-400/10 overflow-hidden transition-all',
		isSelected && 'bg-orange-101',
		disabled && 'opacity-50 cursor-not-allowed grayscale'
	)}
>
	<!-- pattern -->
	<div class="w-full max-w-[50em] absolute top-0">
		<img src="/pattern-2.jpg" alt="pattern" class="w-full h-full grayscale opacity-10" />
	</div>

	<!-- basic info -->
	<div class="w-full flex flex-col items-start justify-start pl-8">
		<!-- gradient -->
		<div
			class="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-dark-100/20 from-30% to-transparent -translate-y-10"
		></div>

		<Flex className="w-auto flex-row items-center justify-between gap-2">
			<p class="text-xl font-gothic-one opacity-50">
				{player?.position}
			</p>

			<span class="p-1 rounded-full bg-white-100"></span>

			<p class="text-xl font-gothic-one opacity-50">
				{player?.weight}
			</p>
		</Flex>

		<div
			class="w-auto max-w-[70%] flex flex-row items-start justify-start flex-wrap text-wrap relative"
		>
			<h1 class="text-[2em] font-gothic-one text-wrap">
				<span>{player?.fullName?.split(' ')[0]}</span>

				<span class="relative">
					{player?.fullName?.split(' ')[1]}

					{#if player?.verified}
						<span class="absolute -top-1 -right-2 translate-x-2">
							<BadgeCheck size={20} class="stroke-white-100 fill-orange-101" />
						</span>
					{/if}
				</span>
			</h1>
		</div>

		<Flex className="w-auto mt-3">
			<span class={cn('text-xs font-poppins', isSelected ? 'text-white-100' : 'etxt-white-200')}>
				{player?.active ? 'Active' : 'Inactive'}
			</span>

			<div class="flex-center relative">
				<div
					class={cn(
						'w-3 h-3 animate-ping rounded-full',
						player?.active && !isSelected
							? 'bg-green-100'
							: player?.active && isSelected
								? 'bg-white-100'
								: 'bg-red-305'
					)}
				></div>
				<div
					class={cn(
						'w-2 h-2 rounded-full absolute',
						player?.active && !isSelected
							? 'bg-green-100'
							: player?.active && isSelected
								? 'bg-white-100'
								: 'bg-red-305'
					)}
				></div>
			</div>
		</Flex>

		<br />

		<Flex className="w-full flex-row items-center justify-start gap-2">
			<h1 class="text-sm font-gothic-one flex flex-row items-center justify-start gap-2">
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 512 512"
					><path
						fill="currentColor"
						d="m183.3 27.47l-13.9 3.47c1.3 46.77 4.4 95.66 2.5 138.36c-2 45.3-8.9 84.5-32.9 106.7v211h234V276c-24-22.2-30.9-61.4-32.9-106.7c-1.9-42.7 1.2-91.59 2.5-138.36l-13.9-3.47c-1.1 22.08-5.3 46.02-14.5 66.25C303.4 117.5 284 137 256 137s-47.4-19.5-58.2-43.28c-9.2-20.23-13.4-44.17-14.5-66.25m18.2 3.33c1.4 19.18 5.4 39.48 12.7 55.48C223.4 106.5 236 119 256 119s32.6-12.5 41.8-32.72c7.3-16 11.3-36.3 12.7-55.48C286.9 42.47 272 49 256 49s-30.9-6.53-54.5-18.2m-50 4.59l-14.4 3.6c.4 37.62 3.8 78.91 1.9 117.41c-2 39.5-9.8 76.6-34 102.9V487h16V267.7l3.4-2.7c18.8-15.2 27.5-50.8 29.5-96.5c1.8-40.1-1-87.14-2.4-133.11m209 0c-1.4 45.97-4.2 93.01-2.4 133.11c2 45.7 10.7 81.3 29.5 96.5l3.4 2.7V487h16V259.3c-24.2-26.3-32-63.4-34-102.9c-1.9-38.5 1.5-79.79 1.9-117.41zM295.4 224c9.4 0 16.8 2.8 22.3 8.4s8.2 13.1 8.2 22.4c0 6.2-1.5 12.2-4.4 18s-7.4 11.7-13.3 17.7c-8.3 8.5-14 14.5-16.9 18.2s-5 7.4-6.3 11.3h42.4v19.5h-63.9v-16.4c2.1-6.2 5.2-12.4 9.2-18.6c4-6.3 9.8-13.4 17.5-21.5c5.9-6.3 9.8-10.7 11.6-13.2c1.8-2.4 3.2-4.7 4.2-7s1.5-4.6 1.5-6.9c0-4.1-1-7.2-3-9.5c-2.1-2.3-5.1-3.5-9-3.5s-6.8 1.4-8.9 4.1s-3.4 6.7-4 12.2l-18.3-1.3c1-11.1 4.2-19.5 9.5-25.2q7.95-8.7 21.6-8.7m-76.3 1.8h20.4v71.9h12.2v17.6h-12.2v24.2h-17.3v-24.2h-41.6v-17.8zm3.6 20.6c-1.1 3.1-3.1 7.6-6.1 13.6l-20.7 37.7h26.3V263c0-3 0-6.3.1-9.8c.2-3.5.3-5.8.4-6.8"
					/></svg
				>
				{player?.jerseyNumber?.length > 0 ? player?.jerseyNumber : '---'}
			</h1>
		</Flex>
	</div>

	<img
		src={player?.profilePicture}
		alt={player?.fullName}
		class="w-[12em] absolute top-0 translate-y-3 -right-1 scale-[1.1]"
	/>

	<!-- custom check button -->
	<button
		class={cn(
			'w-10 h-10 rounded-2xl flex flex-center absolute top-2 right-2 scale-[.90] transition-all duration-300 active:scale-[.75]',
			isSelected ? 'bg-white-100' : 'bg-dark-103 border-[1px] border-white-400/30 '
		)}
		on:click={() => onSelect(player)}
	>
		{#if isSelected}
			<Check strokeWidth={3} size={20} class="stroke-orange-101" />
		{/if}
	</button>
</div>
