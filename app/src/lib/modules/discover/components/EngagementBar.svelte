<script lang="ts">
	import { useBrowser } from '@/hooks/useBrowser';
	import useDetectDevice from '@/hooks/useDetectDevice';
	import { cn } from '@/utils';
	import { Eye, Heart, Sparkles, Telescope } from 'lucide-svelte';
	import { onMount } from 'svelte';

	const deviceInfo = useDetectDevice();
	$: isMobileVP = false;

	const bars = [
		{
			id: 'teams',
			title: null
		},
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

	onMount(() => {
		const { isMobile } = useBrowser();
		window.addEventListener('resize', () => {
			isMobileVP = isMobile;
		});

		return () => {
			window.removeEventListener('resize', () => {});
		};
	});

	export let likesCount: number = 0;
	export let viewsCount: number = 0;
	export let youLiked: boolean = false;
	export let teams: {
		img: (string | null)[];
	} | null = null;
	export let onInsight: () => void = () => {};
</script>

<div
	class={cn(
		'w-auto h-auto absolute right-2 pr-1 z-[100]',
		// isMobileVP ? 'bottom-[10em]' : 'bottom-[7em]'
		deviceInfo?.device?.type === 'smartphone' ? 'bottom-[5em]' : 'bottom-[7em]'
	)}
>
	<div
		class="w-full max-w-[100px] h-auto max-h-[200px] py-10 rounded-lg z-[100] flex flex-col gap-2 items-end justify-end"
	>
		{#each bars as bar}
			<button
				class={cn(
					'p-1 px-3 enableBounceEffect rounded-lg bg-transparent text-brown-100 text-sm text-center flex-center flex-col gap-3'
					// ['like', 'views'].includes(bar.id) && 'hover:bg-white-100/20 hover:backdrop-blur-sm'
				)}
				on:click={() => {
					if (bar.id === 'insight') {
						onInsight();
					}
				}}
			>
				<span>
					{#if bar.id === 'like'}
						<Heart
							size={25}
							class={cn('fill-brown-100', youLiked && 'fill-red-302 stroke-red-302')}
						/>
						<span class="font-poppins text-xs mt-1">
							{likesCount}
						</span>
					{:else if bar.id === 'views'}
						<Telescope size={25} class="fill-brown-100" />
						<span class="text-xs mt-1">{viewsCount}</span>
					{:else if bar.id === 'insight'}
						<Sparkles size={25} class="stroke-brown-100" strokeWidth={1.5} />
					{:else if bar.id === 'teams'}
						<div class="flex flex-col -space-y-2 rtl:space-x-reverse gap-0">
							{#if teams}
								{#each teams.img as team, index}
									<img
										src={team}
										alt="team"
										class={cn(
											'w-[32px] h-[32px] object-cover rounded-full',
											'border-[2px] border-white-100'
										)}
									/>
								{/each}
							{/if}
						</div>
					{/if}
				</span>
			</button>
		{/each}
	</div>
</div>
