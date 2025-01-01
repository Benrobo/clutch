<script lang="ts">
	import AuthLayout from '@/components/AuthLayout.svelte';
	import BottomNavTab from '@/components/BottomNavTab.svelte';
	import { useBrowser } from '$lib/hooks/useBrowser';
	import { cn } from '$lib/utils';
	import { afterUpdate, onMount } from 'svelte';
	import useDetectDevice from '@/hooks/useDetectDevice';

	const deviceInfo = useDetectDevice();
	$: isSafariMobile =
		deviceInfo?.device?.type === 'smartphone' && deviceInfo?.os?.name.toLowerCase() === 'ios';
</script>

<AuthLayout>
	<div class="w-screen h-screen flex flex-col bg-dark-103">
		<main class={cn('flex-1 overflow-hidden relative pb-[4em]', isSafariMobile && 'pbh-[10em]')}>
			<div class="w-full h-full mx-auto md:max-w-[678px]">
				<slot />
			</div>
		</main>
		<BottomNavTab />
	</div>
</AuthLayout>

<style>
	:global(body) {
		overflow: hidden;
		background-color: #000;
		height: 100%;
	}
</style>
