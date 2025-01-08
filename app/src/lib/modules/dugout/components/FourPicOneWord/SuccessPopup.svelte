<script lang="ts">
	import { cn } from '@/utils';
	import { fly } from 'svelte/transition';
	import ThreeDButton from '../ThreeDButton.svelte';
	import { Star } from 'lucide-svelte';
	import { useConfetti } from '$lib/modules/dugout/hooks/useConfetti';
	import { onMount } from 'svelte';
	import type { FourPicOneWordChallenge } from '@/types/dugout';
	import Flex from '@/components/Flex.svelte';
	import { createMutation } from '@tanstack/svelte-query';
	import { completeChallenge } from '@/http/requests';
	import queryClient from '@/config/tanstack-query';
	import toast from 'svelte-french-toast';

	export let secretWord: string = '';
	export let media: FourPicOneWordChallenge['media'] = [];
	export let score: number = 0;
	export let level: string = '';
	export let currentChallenge: FourPicOneWordChallenge | null = null;
	export let gameId: string = '';
	export let onClose: () => void = () => {};

	const { startConfetti } = useConfetti(15000);

	$: markChallengeLevelComplete = createMutation({
		mutationFn: async () => completeChallenge(gameId, currentChallenge?.id?.toString() as string),
		onSuccess: () => {
			// Invalidate queries to refresh the data
			queryClient.invalidateQueries({ queryKey: ['current-challenge', gameId] });
			queryClient.invalidateQueries({ queryKey: ['dugout-games-progress'] });
			queryClient.invalidateQueries({ queryKey: ['dugout-user-stats'] });
			queryClient.invalidateQueries({ queryKey: ['get-game-points', gameId] });
			onClose();
		},
		onError: () => {
			toast.error('Something went wrong.');
			onClose();
		}
	});

	onMount(() => {
		console.log({ currentChallenge });
		startConfetti();
	});
</script>

<div
	class="w-full h-screen flex-center absolute top-0 left-0 bg-gradient-to-b from-[#3f2e5e] via-[#23203c] to-[#61488f] flex-col"
	transition:fly={{ y: -100, duration: 300 }}
>
	<div class="w-full h-auto flex-center relative flex-col">
		<!-- radial blur -->
		<div class="w-full absolute left-0 top-[1rem] flex-center">
			<div class="w-[300px] h-[300px] bg-[#81b6ff] blur-[100px] rounded-full" />
		</div>

		<Flex
			className="w-full h-auto gap-0 flex-col items-center justify-center -translate-y-[14em] absolute top-0 left-0"
		>
			<h1 class="text-white text-2xl font-light font-cyber">
				{level.toUpperCase()}
			</h1>
			<img src="/level-complete-ribbon.svg" alt="ribbon" class="w-[14em]" />
		</Flex>
		<div
			class="w-full max-w-[400px] h-[350px] border-[3px] border-white/20 outline outline-[10px] outline-dark-100/30 rounded-lg relative"
		>
			<div class="w-full h-full grid grid-cols-2 gap-0">
				{#each media as media, index}
					<div
						class={cn(
							'w-full h-full overflow-hidden',
							index === 0 ? 'rounded-tl-md' : '',
							index === 1 ? 'rounded-tr-md' : '',
							index === 2 ? 'rounded-bl-md' : '',
							index === 3 ? 'rounded-br-md' : ''
						)}
					>
						<img
							src={`/assets/${media.url}`}
							alt={media.description}
							class="w-full h-full object-cover"
						/>
					</div>
				{/each}
			</div>

			<div class="w-full h-auto absolute bottom-0 translate-y-[2em] left-0 flex-center">
				<p
					class={cn(
						'px-[4em] bg-gradient-to-b from-[#FF7063] via-[#FF686F] to-[#FF5887] rounded-t-xs p-4 border-t-[4px] border-t-[#FFAF8F] text-center rounded-full shadow-dark-100/70 shadow-lg ',
						'text-xl font-medium'
					)}
				>
					<span class="px-4"> {secretWord.toUpperCase()} </span>
				</p>
			</div>
		</div>
	</div>
	<br />
	<br />
	<br />
	<br />
	<ThreeDButton
		colorType="orange"
		className={cn(
			'w-full h-[70px] max-w-[200px] flex items-center justify-between px-6 py-4 rounded-lg',
			$markChallengeLevelComplete.isPending && 'animate-pulse pointer-events-none'
		)}
		disabled={$markChallengeLevelComplete.isPending}
		onClick={() => {
			$markChallengeLevelComplete.mutate();
		}}
	>
		<span
			class={cn(
				' p-2 bg-gradient-to-b from-[#FFE442] fromn-10% to-90% to-[#FCAB1B] border-t-[1px] border-t-[#FFFF7E] border-l-[1px] border-l-[#FFFF7E] border-r-[1px] border-r-[#FFFF7E] rounded-full shadow-dark-100/30 shadow-md',
				$markChallengeLevelComplete.isPending && 'animate-spin'
			)}
		>
			<Star class="fill-[#ef9e11] stroke-[#a16a0a]" strokeWidth={0.5} />
		</span>

		<span class="text-2xl text-white-100 font-semibold"> {score} </span>

		<span class="text-2xl font-semibold text-[#FFFF7E]"> Next</span>
	</ThreeDButton>
</div>
