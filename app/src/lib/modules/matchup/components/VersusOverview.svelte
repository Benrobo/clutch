<script lang="ts">
	import Flex from '@/components/Flex.svelte';
	import type { Player } from '@/types/matchup';
	import { X } from 'lucide-svelte';

	export let onClose: () => void;
	export let challenger: Player;
	export let opponent: Player;
</script>

<div class="w-full h-full bg-dark-109 flex flex-col items-center justify-between p-0 relative">
	<!-- close btn -->
	<button
		class="absolute top-5 right-5 w-[45px] h-[45px] md:w-[55px] md:h-[55px] bg-dark-111 rounded-full flex flex-center enableBounceEffect z-[1]"
		on:click={onClose}
	>
		<X size={18} class="stroke-white-100" strokeWidth={3} />
	</button>

	<div class="w-full h-[50vh] flex flex-col items-center justify-center gap-0 relative">
		<!-- stripe -->
		<Flex className="w-full h-full absolute top-0 left-0 flex items-center justify-center gap-5">
			{#each Array(4) as _}
				<div class="w-[24px] h-full bg-[#464d54]/30"></div>
			{/each}
		</Flex>

		<div
			class="w-full max-w-[200px] md:max-w-[250px] h-full max-h-[200px] md:max-h-[250px] bg-dark-111 rounded-full shadow-xl shadow-white-100/5 overflow-hidden border-[2px] border-dark-109 z-[1]"
		>
			<img src={challenger?.profilePicture} alt="" class="w-full h-full object-cover" />
		</div>
		<span class="font-mouzambik text-white-100 text-[2em] md:text-[3em] z-[1]">
			{challenger?.fullName.toUpperCase()}
		</span>
		<span
			class="px-3 py-[4px] rounded-full flex items-center justify-center gap-1 bg-dark-103 font-poppins text-white-300 text-xs z-[1] border-[1px] border-white-400/30"
		>
			<span class="text-[1em]">🔰</span>
			Pitcher
		</span>
	</div>
	<div
		class="w-full h-auto flex flex-col items-center justify-center absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 gap-0"
	>
		<span class="font-facon font-normal text-white-100 text-[2em] md:text-[3em]"> VS </span>
	</div>
	<div class="w-full h-[50vh] flex flex-col items-center justify-center gap-3 bg-dark-110">
		<div
			class="w-full max-w-[200px] md:max-w-[250px] h-full max-h-[200px] md:max-h-[250px] bg-dark-111 rounded-full shadow-xl shadow-white-100/5 overflow-hidden border-[2px] border-dark-109 z-[1]"
		>
			<img src={opponent?.profilePicture} alt="" class="w-full h-full object-cover" />
		</div>
		<span class="font-mouzambik text-white-100 text-[2em] md:text-[3em] z-[1]">
			{opponent?.fullName.toUpperCase()}
		</span>
		<span
			class="px-3 py-[4px] rounded-full flex items-center justify-center gap-1 bg-dark-103 font-poppins text-white-300 text-xs z-[1] border-[1px] border-white-400/30"
		>
			<span class="text-[1em]">🔰</span>
			Pitcher
		</span>
	</div>
</div>
