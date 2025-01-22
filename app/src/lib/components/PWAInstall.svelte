<script lang="ts">
	import { onMount, afterUpdate } from 'svelte';
	import { getPWADisplayMode } from '@/utils';

	let deferredPrompt: any | null = null;
	let displayMode: 'standalone' | 'twa' | 'browser' = getPWADisplayMode();

	// Function to trigger the installation prompt
	async function installApp() {
		if (deferredPrompt) {
			try {
				deferredPrompt.prompt();
				const { outcome } = await deferredPrompt.userChoice;
				if (outcome === 'accepted') {
					console.log('User accepted the A2HS prompt');
					deferredPrompt = null; // Clear the prompt after installation
				} else {
					console.log('User dismissed the A2HS prompt');
				}
			} catch (error) {
				console.error('Installation failed:', error);
			}
		}
	}

	// Function to detect the current display mode

	// Update displayMode after the component mounts or updates
	afterUpdate(() => {
		displayMode = getPWADisplayMode();
		console.log('Display mode:', displayMode);
	});

	// Add event listener for the beforeinstallprompt event
	onMount(() => {
		const handleBeforeInstallPrompt = (e: any) => {
			e.preventDefault();
			deferredPrompt = e;
			console.log('beforeinstallprompt event fired');
		};

		window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

		// Cleanup the event listener when the component is destroyed
		return () => {
			window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
		};
	});
</script>

{#if displayMode !== 'standalone' && deferredPrompt}
	<div
		class="w-full h-auto bg-red-305 absolute top-0 left-0 z-[100] px-4 py-2 flex flex-row items-center justify-between"
	>
		<p class="text-white-100 font-poppins font-normal text-[11px]">
			Add to home screen for better experience
		</p>
		<button
			class="bg-white-100 text-red-305 px-4 py-1 rounded-full text-xs font-poppins font-medium enableBounceEffect"
			on:click={installApp}
		>
			Install
		</button>
	</div>
{/if}
