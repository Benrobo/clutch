<script lang="ts">
	import Flex from '@/components/Flex.svelte';
	import SplashScreen from './SplashScreen.svelte';
	import GameArea from './GameArea.svelte';
	import { fade } from 'svelte/transition';
	import { cn } from '@/utils';

	$: hideSplashScreen = true;
	$: showGameArea = false;

	const onHideSplashScreen = () => {
		hideSplashScreen = !hideSplashScreen;
	};

	$: {
		if (!hideSplashScreen) {
			setTimeout(() => {
				showGameArea = true;
			}, 500);
		}
	}
</script>

<div
	class={cn(
		'w-full h-full flex flex-col items-center justify-center max-w-[678px] mx-auto transition-all duration-1000 relative ',
		!hideSplashScreen && 'bg-none duration-500'
	)}
	transition:fade={{ duration: 1000 }}
>
	{#if hideSplashScreen}
		<div class="w-full h-full" transition:fade={{ duration: 500 }}>
			<SplashScreen {onHideSplashScreen} />
		</div>
	{/if}

	{#if showGameArea}
		<GameArea />
	{/if}
</div>

<style>
</style>
