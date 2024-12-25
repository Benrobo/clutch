<script lang="ts">
	import AuthLayout from '@/components/AuthLayout.svelte';
	import BottomNavTab from '@/components/BottomNavTab.svelte';
	import { useBrowser } from '$lib/hooks/useBrowser';
	import { cn } from '$lib/utils';
	import { afterUpdate, onMount } from 'svelte';

	$: isSafariMobile = false;

	const checkBrowser = () => {
		const { isSafari, isMobile } = useBrowser();
		isSafariMobile = isSafari && isMobile;
	};

	onMount(() => {
		checkBrowser();
		window.addEventListener('resize', checkBrowser);
		return () => window.removeEventListener('resize', checkBrowser);
	});
</script>

<div class="w-screen h-screen flex flex-col bg-dark-103">
	<main class={cn('flex-1 overflow-hidden relative pb-[4em]', isSafariMobile && 'pbh-[10em]')}>
		<div class="w-full h-full mx-auto md:max-w-[643px]">
			<slot />
		</div>
	</main>
	<BottomNavTab />
</div>

<style>
	:global(body) {
		overflow: hidden;
		background-color: #000;
		height: 100%;
	}
</style>
