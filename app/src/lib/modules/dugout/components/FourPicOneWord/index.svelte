<script lang="ts">
	import Flex from '@/components/Flex.svelte';
	import SplashScreen from './SplashScreen.svelte';
	import GameArea from './GameArea.svelte';
	import { fade } from 'svelte/transition';
	import { cn } from '@/utils';
	import { goto } from '$app/navigation';

	$: showSplashScreen = true;
	$: showGameArea = false;

	const onHideSplashScreen = () => {
		showSplashScreen = !showSplashScreen;
	};

	$: {
		if (!showSplashScreen) {
			setTimeout(() => {
				showGameArea = true;
			}, 500);
		}
	}

	const onLeaveGame = () => {
		showSplashScreen = true;
		showGameArea = false;
		setTimeout(() => {
			goto('/home/dugout');
		}, 1000);
	};
</script>

<div
	class={cn(
		'w-full h-full flex flex-col items-center justify-center max-w-[678px] mx-auto transition-all duration-1000 relative ',
		!showSplashScreen && 'bg-none duration-500'
	)}
	transition:fade={{ duration: 1000 }}
>
	{#if showSplashScreen}
		<div class="w-full h-full" transition:fade={{ duration: 500 }}>
			<SplashScreen {onHideSplashScreen} />
		</div>
	{/if}

	{#if showGameArea}
		<GameArea leaveGame={onLeaveGame} />
	{/if}
</div>

<style>
</style>
