<script lang="ts">
	import BottomSheet from '@/components/BottomSheet.svelte';
	import Flex from '@/components/Flex.svelte';
	import { players } from '@/data/matchup';
	import Notfound from '@/modules/matchup/components/Notfound.svelte';
	import PlayersCardInfo from '@/modules/matchup/components/PlayersCardInfo.svelte';
	import type { Player } from '@/types/matchup';
	import { cn } from '@/utils';
	import { X } from 'lucide-svelte';
	import { afterUpdate } from 'svelte';

	export let title: string;

	const challenger = players[0];
	const opponent = players[1];
</script>

<div class="w-full h-full bg-dark-109 flex flex-col items-center justify-between p-0 relative">
	<!-- close btn -->
	<button
		class="absolute top-5 right-5 w-[45px] h-[45px] md:w-[55px] md:h-[55px] bg-dark-111 rounded-full flex flex-center enableBounceEffect"
	>
		<X size={18} class="stroke-white-100" strokeWidth={3} />
	</button>

	<div class="w-full h-[50vh] flex flex-col items-center justify-center gap-5">
		<div
			class="w-full max-w-[200px] md:max-w-[250px] h-full max-h-[200px] md:max-h-[250px] bg-dark-111 rounded-full shadow-lg overflow-hidden border-[2px] border-dark-109"
		>
			<img src={challenger?.profilePicture} alt="" class="w-full h-full object-cover" />
		</div>
		<span class="font-mouzambik text-white-100 text-[2em] md:text-[3em]">
			{challenger?.fullName.toUpperCase()}
		</span>
	</div>
	<div
		class="w-full h-auto flex flex-col items-center justify-center absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 gap-0"
	>
		<span class="font-facon font-normal text-white-100 text-[2em] md:text-[3em] mb-2 leading-none">
			VS
		</span>
	</div>
	<div class="w-full h-[50vh] flex flex-col items-center justify-center gap-5 bg-dark-110">
		<div
			class="w-full max-w-[200px] md:max-w-[250px] h-full max-h-[200px] md:max-h-[250px] bg-dark-111 rounded-full shadow-lg overflow-hidden border-[2px] border-dark-109"
		>
			<img src={opponent?.profilePicture} alt="" class="w-full h-full object-cover" />
		</div>
		<span class="font-mouzambik text-white-100 text-[2em] md:text-[3em]">
			{opponent?.fullName.toUpperCase()}
		</span>
	</div>
</div>
