<script lang="ts">
	import Modal from '@/components/Modal.svelte';
	import { cn } from '@/utils';
	import { X } from 'lucide-svelte';
	import mlbGlossary from '$lib/data/mlb-glossary-simplified.json';
	import Flex from '@/components/Flex.svelte';
	import Divider from '@/components/Divider.svelte';
	import { afterUpdate } from 'svelte';

	export let onClose: () => void = () => {};
	export let keyword: string | null = null;
	export let showModal: boolean = false;

	$: searchedItem = mlbGlossary.find(
		(item) => item.title.toLowerCase() === (keyword?.toLowerCase() ?? '')
	);

	// $: console.log({ searchedItem });

	afterUpdate(() => {
		// console.log({ searchedItem, keyword });
	});
</script>

{#if showModal}
	<Modal showBackdrop={false} show={showModal} {onClose} showCloseButton={false}>
		<div
			class="w-full h-full min-h-[200px] bg-brown-100 shadow-dark-100 shadow-2xl rounded-md relative"
		>
			<button
				class={cn(
					'p-2 rounded-full bg-dark-103/5 hover:bg-dark-103/10 transition-colors absolute top-3 right-3'
				)}
				on:click={onClose}
			>
				<X size={20} strokeWidth={2} class={cn('stroke-dark-100/60')} />
			</button>

			<Flex class="w-full h-full flex-col px-4 py-5">
				<!-- title -->
				<h1 class="text-dark-100 font-semibold font-garamond text-xl">
					{searchedItem?.title}
				</h1>

				<Divider className="my-4 h-[1px] bg-dark-100/10" />

				<!-- definition -->
				<div class="w-full flex flex-col gap-2 cursor-text">
					{#if searchedItem?.summary}
						{#each searchedItem?.summary.split('\n') as word}
							<span
								class={cn(
									'text-dark-100 font-normal font-poppins cursor-text',
									searchedItem?.summary?.length > 300
										? 'text-[14px]'
										: searchedItem?.summary?.length > 100
											? 'text-md'
											: 'text-lg'
								)}
							>
								{word}
							</span>
						{/each}
					{/if}
				</div>
			</Flex>
		</div>
	</Modal>
{/if}
