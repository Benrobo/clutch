<script lang="ts">
	import Flex from '@/components/Flex.svelte';
	import ThreeDButton from '../ThreeDButton.svelte';
	import { fade } from 'svelte/transition';
	import { X } from 'lucide-svelte';
	import Spinner from '@/components/Spinner.svelte';

	// export let onHideSplashScreen: () => void = () => {};
	export let loading: boolean = false;
	export let onClick: () => void = () => {};
	// export let leaveGame: () => void = () => {};
</script>

<div class="w-full h-screen bg-gradient-to-b from-[#5430B7] via-[#0063D8] to-[#00AAEF]">
	<div
		class="w-full h-full absolute top-0 left-0"
		style="background-image: url('/images/4snap/splash-screen-transparent.png'); background-size: contain; background-position: center;"
	/>

	<!-- <ThreeDButton
		colorType="orange"
		className="w-[45px] h-[45px] flex-center rounded-full absolute top-2 left-2 scale-[.70] transition-all"
		onClick={leaveGame}
	>
		<X class="stroke-white-100" />
	</ThreeDButton> -->
</div>

<!-- splash action button -->
<Flex className="w-full h-auto min-h-[40em] flex-center absolute bottom-10">
	<ThreeDButton
		className="w-full max-w-[200px] h-auto py-4 px-4 rounded-lg flex-center"
		onClick={() => {
			onClick();
		}}
	>
		{#if loading}
			<Spinner strokeWidth="3" />
		{:else}
			<span class="text-white text-lg font-bold">Play</span>
		{/if}
	</ThreeDButton>
</Flex>
