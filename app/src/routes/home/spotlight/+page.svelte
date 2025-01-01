<script lang="ts">
	import BottomSheet from '@/components/BottomSheet.svelte';
	import Flex from '@/components/Flex.svelte';
	import Spinner from '@/components/Spinner.svelte';
	import { getSpotlights } from '@/http/requests';
	import SpotlightCard from '@/modules/spotlight/components/SpotlightCard.svelte';
	import SpotLightDetail from '@/modules/spotlight/components/SpotLightDetail.svelte';
	import type { SpotlightsResponse } from '@/types/spotlight';
	import { calculateReadingTime, extractAxiosResponseData } from '@/utils';
	import { createQuery } from '@tanstack/svelte-query';
	import { Lightbulb, X } from 'lucide-svelte';

	let selectedSpotlight: string | null = null;
	$: selectedSpotlight = null;

	$: getSpotlightsQuery = createQuery({
		queryKey: ['get-spotlights'],
		queryFn: async () => await getSpotlights()
	});

	let spotlights: SpotlightsResponse[] = [];
	$: spotlights = [];

	$: fetchingSpotlight = $getSpotlightsQuery?.isLoading;

	$: {
		if ($getSpotlightsQuery.isSuccess) {
			const data = extractAxiosResponseData($getSpotlightsQuery.data, 'success')
				?.data as SpotlightsResponse[];
			spotlights = data;
		}
	}
</script>

<svelte:head>
	<title>Spotlight</title>
</svelte:head>

<div class="w-screen h-screen mx-auto fixed top-0 left-0 flex-center bg-dark-103">
	<div
		class="w-full h-full max-w-[678px] mx-auto flex flex-col relative overflow-y-auto hideScrollBar2 pb-20 gap-2"
	>
		<!-- header -->
		<Flex
			className="w-full h-auto flex-row items-center justify-between px-4 py-5 sticky top-0 left-0 z-[3] border-b-[1px] border-white-400/30 bg-dark-103"
		>
			<div class="flex flex-row flex-center gap-2">
				<Lightbulb size={20} class="text-white-100" />
				<h1 class="text-white-100 text-xl font-recoleta font-normal">Spotlight</h1>
			</div>
		</Flex>

		<!-- keywords -->
		<!-- <Flex
			className="w-full h-auto flex-row items-center justify-between px-4 py-5 sticky top-0 left-0 z-[3]"
		>
			
		</Flex> -->

		{#if fetchingSpotlight}
			<div class="w-full h-full flex-center">
				<Spinner size={'18'} />
			</div>
		{/if}

		<!-- spotlights list -->
		<div class="px-3 py-[1em] flex flex-col items-start justify-start gap-7">
			{#if !fetchingSpotlight && spotlights.length > 0}
				{#each spotlights as spl}
					<SpotlightCard
						thumbnail={spl.photo}
						title={spl?.title.trim()}
						description={spl?.headline.trim()}
						readingTime={spl?.readingTime}
						onClick={() => {
							selectedSpotlight = spl.id;
						}}
					/>
				{/each}
			{/if}
		</div>
	</div>
</div>

<BottomSheet
	isOpen={!!selectedSpotlight}
	rounded={true}
	showBackdrop={true}
	className="bg-dark-107 min-h-[95vh] py-0 overflow-hidden"
	showCloseButton={false}
	showDragHandle={false}
	onClose={() => {
		selectedSpotlight = null;
	}}
>
	<!-- control header -->
	<Flex
		className="w-full h-auto flex-row items-center justify-between px-4 py-5 absolute top-0 left-0 z-[3]"
	>
		<button
			on:click={() => {
				selectedSpotlight = null;
			}}
			class="bg-dark-103/60 p-[5px] rounded-full flex-center"
		>
			<X size={20} class="stroke-white-100" />
		</button>
	</Flex>

	<SpotLightDetail selectedSpotLight={selectedSpotlight} />
</BottomSheet>
