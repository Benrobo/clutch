<script lang="ts">
	import Flex from '@/components/Flex.svelte';
	import { fakeSpotlightData } from '@/data/spotlight';
	import { Clock, Maximize } from 'lucide-svelte';
	import SpotlightSources from './SpotlightSources.svelte';
	import MarkdownRenderer from '@/components/MarkdownRenderer.svelte';
	import { capitalizeFirstLetter, cn } from '@/utils';

	export let selectedSpotLight: string | null = null;

	const spotlightData = fakeSpotlightData;
	const content = spotlightData?.body?.split('\n\n').filter((c) => c?.length > 0);

	$: shouldExpand = false;
</script>

<Flex
	className="w-full h-screen flex flex-col gap-4 absolute top-0 left-0 overflow-y-scroll hideScrollBar2 pb-[10em]"
>
	<!-- thumbnail -->
	<img
		src={fakeSpotlightData?.photo}
		class="w-full h-[400px] object-cover bg-dark-100"
		alt="spotlight"
	/>

	<!-- header details -->
	<Flex className="w-full flex-row items-end justify-between px-4 py-2">
		<Flex className="w-auto flex-col">
			<h1 class="text-sm md:text-xl text-nowrap font-medium text-white-100 font-brunoace">
				{capitalizeFirstLetter(fakeSpotlightData?.title)}
			</h1>
			<!-- <p class="text-xs font-normal text-white-300 font-poppins">
				{fakeSpotlightData?.headline}
			</p> -->
			<Flex className="w-auto flex flex-row items-center justify-center">
				<div class="text-white-300 font-inter flex-center gap-2">
					<Clock size={15} class="stroke-white-300" />
					<span class="text-xs font-poppins text-nowrap">
						{spotlightData?.readingTime?.min}min read
					</span>
				</div>
			</Flex>
		</Flex>
	</Flex>

	<!-- content -->
	<Flex
		className={cn(
			'w-full flex flex-col gap-4 px-4 py-2 relative',
			content.join('\n\n').length > 300 && !shouldExpand ? 'h-[40vh] overflow-hidden' : 'h-auto'
		)}
	>
		{#if content}
			{#each content as c, index}
				<MarkdownRenderer content={c} contentClass="font-jetbrains text-[13px]" />
				<SpotlightSources {index} sources={fakeSpotlightData?.sources} />
			{/each}
		{/if}

		{#if content.join('\n\n').length > 300}
			<div
				class={cn(
					'w-full h-auto absolute bottom-0 z-[10] bg-gradient-to-b from-dark-106/10 to-dark-107 pt-10 pb-4 flex-center enableBounceEffect',
					shouldExpand ? '-bottom-10 translate-y-5' : 'bottom-0'
				)}
			>
				<button
					class="w-auto px-4 py-2 rounded-full flex-center text-center text-white-200 bg-dark-106 gap-3 border-[1px] border-white-300/20"
					on:click={() => {
						shouldExpand = !shouldExpand;
					}}
				>
					<Maximize size={15} class="stroke-white-200" />
					<p class="text-xs font-poppins">{shouldExpand ? 'See Less' : 'See More'}</p>
				</button>
			</div>
		{/if}
	</Flex>
</Flex>
