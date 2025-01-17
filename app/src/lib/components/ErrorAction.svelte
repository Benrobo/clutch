<script lang="ts">
	import RotateCcw from 'lucide-svelte/icons/rotate-ccw';
	import Flex from './Flex.svelte';
	import Button from './ui/button.svelte';
	import { cn } from '@/utils';

	export let error: string;
	export let isLoading: boolean;
	export let callback: () => void;
	export let showActionButton = true;
</script>

<Flex className="w-full h-full flex-col items-center justify-center gap-0">
	<p
		class={cn(
			'text-[12px] font-jetbrains text-white-100/80',
			error.length > 100 ? 'line-clamp-3' : ''
		)}
	>
		{error}
	</p>
	{#if showActionButton}
		<Button
			variant="default"
			className="mt-3 bg-orange-101  hover:bg-orange-101 rounded-full border-[.5px] border-white-400/50  gap-3 disabled:opacity-50 disabled:cursor-not-allowed enableMiniBounceEffect text-[12px] scale-[.90]"
			on:click={callback}
			disabled={isLoading}
		>
			Try again
			<RotateCcw size={16} class={cn('rotate-90', isLoading ? 'animate-spin' : '')} />
		</Button>
	{/if}
</Flex>
