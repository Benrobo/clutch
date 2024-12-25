<script lang="ts">
	import { onMount } from 'svelte';
	import { cn } from '@/utils';
	import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import Portal from './Portal.svelte';

	export let isOpen = false;
	export let height = 'h-[50vh]';
	export let showBackdrop = true;
	export let rounded = true;
	export let onClose = () => {};

	let y: number;
	let sheetElement: HTMLDivElement;

	onMount(() => {
		y = 0;
	});
</script>

{#if isOpen}
	<Portal>
		<!-- Backdrop -->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		{#if showBackdrop}
			<div
				class="fixed inset-0 bg-black/30 backdrop-blur-sm"
				style="z-index: 999999;"
				on:click={onClose}
				transition:fade={{ duration: 200 }}
			/>
		{/if}

		<!-- Bottom Sheet -->
		<div
			bind:this={sheetElement}
			style="z-index: 999999;"
			class={cn(
				'fixed bottom-0 left-0 right-0 bg-white-100',
				'transform transition-transform duration-100 ease-out',
				height,
				rounded && 'rounded-t-[20px]',
				'flex flex-col'
			)}
			transition:fly={{ y: '100%', duration: 300, easing: quintOut }}
		>
			<!-- Drag Handle -->
			<div class="w-full h-[24px] flex items-center justify-center cursor-grab touch-pan-y">
				<div class="w-[36px] h-[4px] bg-gray-100 rounded-full" />
			</div>

			<!-- Content -->
			<div class="flex-1 overflow-y-auto">
				<slot />
			</div>
		</div>
	</Portal>
{/if}

<style>
	/* Hide scrollbar for Chrome, Safari and Opera */
	.overflow-y-auto::-webkit-scrollbar {
		display: none;
	}

	/* Hide scrollbar for IE, Edge and Firefox */
	.overflow-y-auto {
		-ms-overflow-style: none; /* IE and Edge */
		scrollbar-width: none; /* Firefox */
	}
</style>
