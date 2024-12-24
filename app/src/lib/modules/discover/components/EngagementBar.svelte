<script lang="ts">
	import { cn } from '@/utils';
	import { Eye, Heart, Sparkles, Telescope } from 'lucide-svelte';

	const bars = [
		{
			id: 'like',
			title: 'Like'
		},
		{
			id: 'views',
			title: null
		},
		{
			id: 'insight',
			title: null
		}
	];

	export let likesCount: number = 0;
	export let viewsCount: number = 0;
</script>

<div class="w-auto h-auto absolute bottom-[10em] right-2 pr-1 z-[100]">
	<div
		class="w-full max-w-[100px] h-full max-h-[200px] py-10 rounded-lg z-[100] flex flex-col gap-3 items-end justify-end"
	>
		{#each bars as bar}
			<button
				class={cn(
					'p-1 px-3 enableBounceEffect rounded-lg bg-transparent text-white-100 text-sm text-center flex-center flex-col gap-3'
					// ['like', 'views'].includes(bar.id) && 'hover:bg-white-100/20 hover:backdrop-blur-sm'
				)}
			>
				<span>
					{#if bar.id === 'like'}
						<Heart size={25} class={cn('fill-white-100', true && 'fill-red-302 stroke-red-302')} />
						<span class="font-poppins text-xs mt-1">
							{likesCount}
						</span>
					{:else if bar.id === 'views'}
						<Telescope size={25} class="fill-white-100" />
						<span class="text-xs mt-1">{viewsCount}</span>
					{:else if bar.id === 'insight'}
						<Sparkles size={25} class="fill-red-302" strokeWidth={1} />
					{/if}
				</span>
			</button>
		{/each}
	</div>
</div>
