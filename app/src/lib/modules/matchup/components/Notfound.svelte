<script lang="ts">
	import Flex from '@/components/Flex.svelte';
	import { cn } from '@/utils';

	export let title = 'No matching results found';
	export let description = 'Try searching for a different player.';
	export let showCTA = true;
	export let ctaText = 'Compare Players';
	export let ctaClassName = '';
	export let isSearch = false;
	export let onClick = () => {};
</script>

<Flex className="w-full h-auto min-h-[70vh] flex-col items-center justify-center ">
	{#if isSearch}
		<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 48 48"
			><g fill="#616161"
				><path d="m29.175 31.99l2.828-2.827l12.019 12.019l-2.828 2.827z" /><circle
					cx="20"
					cy="20"
					r="16"
				/></g
			><path fill="#37474f" d="m32.45 35.34l2.827-2.828l8.696 8.696l-2.828 2.828z" /><circle
				cx="20"
				cy="20"
				r="13"
				fill="#64b5f6"
			/><path
				fill="#bbdefb"
				d="M26.9 14.2c-1.7-2-4.2-3.2-6.9-3.2s-5.2 1.2-6.9 3.2c-.4.4-.3 1.1.1 1.4c.4.4 1.1.3 1.4-.1C16 13.9 17.9 13 20 13s4 .9 5.4 2.5c.2.2.5.4.8.4c.2 0 .5-.1.6-.2c.4-.4.4-1.1.1-1.5"
			/></svg
		>
	{/if}

	<h1 class="text-white-100 text-xl font-bold font-gothic-one">
		{title}
	</h1>
	<p class="text-white-300 text-xs font-light font-poppins">
		{description}
	</p>

	{#if showCTA}
		<button
			class={cn(
				'w-auto max-w-[300px] bg-orange-101 text-white-100 font-gothic-one px-6 py-3 mt-5 rounded-full text-lg enableBounceEffect',
				ctaClassName
			)}
			on:click={onClick}
		>
			{ctaText}
		</button>
	{/if}
</Flex>
