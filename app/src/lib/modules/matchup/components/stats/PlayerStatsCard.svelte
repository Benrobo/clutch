<script lang="ts">
	import Flex from '@/components/Flex.svelte';
	import { pictcherStats, players, teams } from '@/data/matchup';
	import type { Player } from '@/types/matchup';
	import { cn } from '@/utils';
	import { BadgeCheck, Dumbbell, Minus, X } from 'lucide-svelte';

	export let headline: string;
	export let tagline: string;
	export let value: string | number;
</script>

<div
	class="w-full h-auto md:h-[150px] bg-dark-109 flex flex-col items-start justify-between py-5 px-5 relative rounded-2xl gap-4"
>
	<h1
		class={cn(
			'w-full max-w-[140px] leading-none text-white-100/80 text-[.7em] sm:text-[.9em] md:text-[1em] font-gothic-one relative uppercase tracking-wide'
			// headline.length > 12 ? 'text-[.9em]' : 'text-[1em]'
		)}
	>
		{headline}
	</h1>

	<Flex className="relative w-full">
		<div class="w-full h-[1px] bg-white-100/10" />
		<span
			class={cn(
				'text-white-100 text-[2em] sm:text-[2.5em] md:text-[2em] tracking-tighter leading-none font-jetbrains font-extrabold absolute -top-4 -right-3'
				// tagline?.length > 20 ? 'bottom-10' : 'bottom-5'
			)}
		>
			{value}
		</span>
	</Flex>

	<span class="text-white-300/40 text-[10px] sm:text-xs uppercase font-poppins font-light">
		{tagline}
	</span>
</div>
