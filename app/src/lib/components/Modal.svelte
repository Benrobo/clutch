<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { createEventDispatcher, onMount } from 'svelte';
	import { cn } from '$lib/utils';
	import X from 'lucide-svelte/icons/x';
	import { browser } from '$app/environment';
	import type { ClassValue } from 'clsx';

	export let show = false;
	export let closeOnClickOutside = true;
	export let closeOnEscape = true;
	export let showCloseButton = true;
	export let width: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '5xl' | 'full' = 'md';
	export let showBackdrop = true;
	// export let position: "center" | "top" = "center";
	export let contentClass: ClassValue = '';
	export let onClose: () => void = () => {};

	const dispatch = createEventDispatcher();
	let modalContent: HTMLDivElement;

	const widthClasses = {
		sm: 'max-w-sm',
		md: 'max-w-md',
		lg: 'max-w-lg',
		xl: 'max-w-xl',
		'2xl': 'max-w-2xl',
		'5xl': 'max-w-5xl',
		full: 'max-w-[95vw]'
	} as const;

	const positionClasses = {
		center: 'items-center',
		top: 'items-start pt-20'
	} as const;

	function close() {
		show = false;
		dispatch('close');
		onClose();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (closeOnEscape && event.key === 'Escape' && show) {
			event.preventDefault();
			close();
		}
	}

	function handleBackdropClick(event: any) {
		if (!closeOnClickOutside) return;

		const target = event.target as HTMLElement;
		if (modalContent && !modalContent.contains(target)) {
			close();
		}
	}

	// Lock body scroll when modal is open
	$: if (browser) {
		if (show) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if show}
	<div
		class="fixed inset-0 top-0 left-0 w-screen h-screen z-[999999999]"
		in:fade={{ duration: 200 }}
		out:fade={{ duration: 50 }}
	>
		<!-- Backdrop with button for interaction -->
		{#if showBackdrop}
			<button
				type="button"
				class="absolute inset-0 w-full h-full bg-dark-100/50 backdrop-blur-md cursor-default"
				on:click={handleBackdropClick}
				aria-label="Close modal"
			/>
		{/if}

		<!-- Modal Container -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div
			class={cn(
				'relative min-h-full w-full flex justify-center items-center'
				// positionClasses[position]
			)}
			on:click={handleBackdropClick}
		>
			<!-- Modal Content -->
			<div
				bind:this={modalContent}
				class={cn(
					'relative w-full h-full mx-auto overflow-auto',
					contentClass,
					widthClasses[width],
					'shadow-lg scrollbar-visible'
				)}
				style="overflow: overlay;"
				role="dialog"
				aria-modal="true"
				in:scale={{ duration: 200, start: 0.95 }}
				out:scale={{ duration: 50, start: 0.5 }}
			>
				<slot />
				{#if showCloseButton}
					<button
						type="button"
						on:click={close}
						class="text-gray-800 border-none outline-none absolute top-2 right-2"
					>
						<X size={20} class="stroke-white-100" />
					</button>
				{/if}
			</div>
		</div>
	</div>
{/if}
