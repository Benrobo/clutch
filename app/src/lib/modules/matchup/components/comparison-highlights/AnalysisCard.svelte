<script lang="ts">
	import { cn } from '@/utils';
	import { Minus, MoveUpRight } from 'lucide-svelte';
	import Divider from '@/components/Divider.svelte';
	import { scale } from 'svelte/transition';

	export let headshot: string;
	export let player: {
		name: string;
	};
	export let stats: {
		key: string;
		value: string;
	}[] = [];
	export let percentage: number;
	export let trend: 'up' | 'down' | string;
	export let publicProfile: string;
	export let type: 'positive' | 'negative';
</script>

<div
	class={cn(
		'w-full h-full min-h-[200px] flex flex-col justify-start items-start gap-3 px-6 py-5 relative',
		type === 'positive' ? 'bg-[#94f4a8]' : 'bg-red-301'
	)}
>
	<!-- player image -->
	<div class="w-[60px] h-[70px] bg-dark-111 border-[4px] border-dark-111 relative">
		<img src={headshot} alt={player?.name} class="w-full h-full object-cover" />

		<!-- first char of first and last name -->
		<div
			class="w-full h-full flex flex-col justify-center items-center gap-0 absolute top-1 -right-10"
		>
			<span
				class="text-[1.8em] md:text-[3em] text-dark-100/50 font-cyber font-extralight leading-none"
			>
				{player?.name.split(' ')[0].charAt(0)}
			</span>
			<span
				class="text-[1.8em] md:text-[3em] text-dark-100/50 font-cyber font-extralight leading-none"
			>
				{player?.name.split(' ')[1].charAt(0)}
			</span>
		</div>
	</div>
	<!-- player stats -->
	<div class="w-full h-full flex flex-col justify-end items-start gap-5 mt-5">
		{#each stats as stat}
			{#if Object.entries(stat).length > 1}
				<div class="w-full h-auto flex flex-col justify-start items-start gap-0">
					<span
						class="text-[2em] md:text-[3em] text-dark-100 font-cyber font-extralight leading-none"
					>
						{stat.value}
					</span>
					<span class="text-[12px] md:text-md text-dark-100 font-garamond leading-none">
						{stat.key}
					</span>
				</div>
			{/if}
		{/each}

		<!-- more info -->
		<div class="w-full h-auto flex-col gap-2">
			<Divider className="w-full h-[.8px] mb-3 bg-dark-100/20" />

			<div class="w-full h-auto flex flex-row items-end justify-between gap-2 z-[1]">
				<div
					class="text-sm text-dark-100 font-poppins font-normal flex items-center justify-center"
				>
					<span class="text-xs md:text-md"> More Info </span>
					<Minus size={20} strokeWidth={1.5} class="stroke-dark-100 translate-y-[1px]" />
				</div>
				<a
					href={publicProfile}
					target="_blank"
					class={cn(
						'w-[30px] h-[30px] md:w-[40px] md:h-[40px] rounded-full flex-center enableBounceEffect relative top-2 z-[1]',
						type === 'positive' ? 'bg-green-100/20' : 'bg-red-305/20'
					)}
				>
					<MoveUpRight size={18} strokeWidth={2} class="stroke-dark-100" />
				</a>
			</div>
		</div>
	</div>

	<!-- percentage increase or decrease -->
	<div
		class="w-auto h-full py-10 absolute top-0 right-0 flex flex-col items-center justfify-center gap-4"
	>
		<span class="text-sm text-dark-100 font-jetbrains font-medium">
			{percentage}%
		</span>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="80"
			height="80"
			viewBox="0 0 24 24"
			class={cn(
				trend === 'up' ? 'rotate-90' : '-rotate-90',
				type === 'positive' ? 'text-green-105' : 'text-red-305'
			)}
		>
			<path
				fill="none"
				stroke="currentColor"
				d="M8 5c0 .742-.733 1.85-1.475 2.78c-.954 1.2-2.094 2.247-3.401 3.046C2.144 11.425.956 12 0 12m0 0c.956 0 2.145.575 3.124 1.174c1.307.8 2.447 1.847 3.401 3.045C7.267 17.15 8 18.26 8 19m-8-7h24"
			/></svg
		>
	</div>
</div>
