<script lang="ts">
	import { onMount } from 'svelte';
	import { cn } from '@/utils';
	import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import Portal from './Portal.svelte';
	import { X } from 'lucide-svelte';
	import type { ClassValue } from 'tailwind-variants';

	export let isOpen = false;
	export let className: ClassValue = '';
	export let showBackdrop = true;
	export let rounded = true;
	export let onClose = () => {};
	export let headline = '';
	export let tagline = '';

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
				class="fixed inset-0 bg-dark-100/5 backdrop-blur-sm"
				style="z-index: 99;"
				on:click={onClose}
				transition:fade={{ duration: 50 }}
			/>
		{/if}

		<!-- Bottom Sheet -->
		<div
			bind:this={sheetElement}
			style="z-index: 100;"
			class={cn(
				'w-full max-w-[600px] mx-auto h-[60vh] bg-white-100',
				'transform transition-transform duration-300 ease-out fixed bottom-0 left-0 right-0',
				'flex flex-col',
				rounded && 'rounded-t-[20px]',
				className
			)}
			transition:fly={{ y: '100%', duration: 300, easing: quintOut }}
		>
			<!-- Drag Handle -->
			<div class="w-full h-[24px] flex items-center justify-center cursor-grab touch-pan-y">
				<div class="w-[36px] h-[4px] bg-gray-100 rounded-full" />
			</div>

			<!-- Header -->
			<div class="px-4 py-2 flex items-center justify-between">
				<div class="flex flex-col">
					{#if headline}
						<h3 class="text-dark-100 font-semibold text-xl">{headline}</h3>
					{/if}
					{#if tagline}
						<span class="text-dark-100/60 text-sm">{tagline}</span>
					{/if}
				</div>
				<button
					class="p-2 rounded-full bg-dark-103/5 hover:bg-dark-103/10 transition-colors"
					on:click={onClose}
				>
					<X size={20} class="stroke-dark-100/60" />
				</button>
			</div>

			<!-- Content -->
			<div class="flex-1 overflow-y-auto px-4">
				<slot />
			</div>
		</div>
		<!-- </div> -->
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
