<script lang="ts">
	import BottomSheet from '@/components/BottomSheet.svelte';
	import Flex from '@/components/Flex.svelte';
	import type { SpotlightContentResponse } from '@/types/spotlight';
	import { extractCleanDomain } from '@/utils';
	import { Pickaxe, X } from 'lucide-svelte';

	export let index: number = 0;
	export let sources: SpotlightContentResponse['sources'] = [];

	const availableSources = sources.filter((s) => s.sources.length > 0);
	const taggedSource = availableSources[index];

	let selectedSource: SpotlightContentResponse['sources'][number] | null = null;
	$: selectedSource = null;
</script>

<Flex className="w-auto">
	{#if taggedSource}
		<button
			class="px-3 py-2 rounded-full border-[.5px] border-white-400/30 text-xs flex-center enableBounceEffect"
			on:click={() => {
				selectedSource = taggedSource;
			}}
		>
			<Flex className="flex-row items-center -space-x-3">
				{#each taggedSource?.sources?.filter((s) => s.title).slice(0, 3) as src}
					<img
						src={src?.favicon}
						alt="logo"
						class="w-[20px] h-[20px] rounded-full object-fill bg-dark-100 border-[.5px] border-white-400/30"
					/>
				{/each}
			</Flex>
			<span class="text-[10px] text-white-300 ml-2"
				>{taggedSource?.sources.filter((s) => s.title)?.length} Sources</span
			>
		</button>
	{/if}
</Flex>

<BottomSheet
	rounded={true}
	showBackdrop={true}
	className="bg-dark-107 h-auto min-h-[10vh] pb-10 px-0 overflow-hidden z-[120]"
	backdropClassName="z-[100]"
	showCloseButton={false}
	showDragHandle={false}
	isOpen={!!selectedSource}
	onClose={() => {
		selectedSource = null;
	}}
>
	<div
		class="w-full h-auto absolute py-4 px-5 top-0 left-0 border-b-[.5px] border-b-white-400/30 flex flex-row items-center justify-between bg-dark-106"
	>
		<Flex className="w-auto flex-row">
			<Pickaxe size={18} class="stroke-white-200" />
			<h1 class="text-white-200 font-recoleta font-normal text-md">Sources</h1>
		</Flex>

		<button
			class="p-2 rounded-full bg-dark-103/60 hover:bg-dark-103/10 transition-colors"
			on:click={() => {
				selectedSource = null;
			}}
		>
			<X size={15} class="stroke-white-200" />
		</button>
	</div>
	<br />
	<div class="w-full h-full pt-[3em] flex flex-col items-start justify-start overflow-y-auto gap-5">
		{#if selectedSource}
			{#each selectedSource?.sources?.filter((s) => s.title) as src, index}
				<a href={src?.url} class="w-full h-auto" target="_blank">
					<Flex className="w-full flex-col p-4 rounded-lg bg-dark-106 drop-shadow-lg">
						<Flex className="w-full flex-row items-center gap-1">
							<span class="text-white-400">
								{index + 1}.
							</span>
							<h1 class="text-white-200 font-poppins font-normal text-sm">
								{src?.title}
							</h1>
						</Flex>
						<Flex className="w-auto flex-row items-center justify-start">
							<img
								src={src?.favicon}
								alt="logo"
								class="w-[20px] h-[20px] rounded-full object-fill bg-dark-100 border-[.5px] border-white-400/30"
							/>
							<span class="text-[12px] text-white-300 font-poppins">
								{extractCleanDomain(src?.url)}
							</span>
						</Flex>
					</Flex>
				</a>
			{/each}
		{/if}
	</div>
</BottomSheet>
