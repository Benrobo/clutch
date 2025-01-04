<script lang="ts">
	import Flex from '@/components/Flex.svelte';
	import ThreeDButton from '../ThreeDButton.svelte';
	import { fade } from 'svelte/transition';

	export let onHideSplashScreen: () => void = () => {};
</script>

<div class="w-full h-full bg-gradient-to-b from-[#5430B7] via-[#0063D8] to-[#00AAEF]">
	<div
		class="w-full h-full absolute top-0 left-0"
		style="background-image: url('/images/4snap/splash-screen-transparent.png'); background-size: contain; background-position: center;"
	/>
</div>

<!-- splash action button -->
<Flex className="w-full h-auto min-h-[40em] flex-center absolute bottom-10">
	<ThreeDButton
		className="w-full max-w-[200px] h-auto py-4 px-4 rounded-lg"
		onClick={onHideSplashScreen}
	>
		<span class="text-white text-lg font-bold">Start</span>
	</ThreeDButton>
</Flex>
