<script lang="ts">
	import HighlightVideoPlayback from './highlight-video-playback.svelte';
	import type { RecommendationData } from '@/types/recommendation';

	export let hl: RecommendationData;
	export let onObServedDataId: (id: string | null) => void = () => {};
	export let currentVideoId: string | null = null;
	export let updateLike: (playbackId: string) => void = () => {};
</script>

<div class="video-container w-full h-full relative">
	<!-- thumbnail background -->
	<div class="w-full h-full absolute inset-0 z-[0]">
		<img
			src={hl?.thumbnail?.fallback}
			alt={hl?.playback?.title}
			class="w-full h-full object-cover opacity-[.50]"
		/>
	</div>

	<!-- main video section -->
	<!-- <div class="absolute inset-0 z-[2] backdrop-blur-xl bg-dark-103/30"> -->
	<div class="h-full inset-0 z-[2] backdrop-blur-xl bg-dark-103/30">
		<HighlightVideoPlayback
			highlight={hl}
			onObServedDataId={(id) => {
				onObServedDataId(id);
			}}
			{currentVideoId}
			{updateLike}
		/>
	</div>
</div>

<style>
	.video-container {
		/* height: 100vh;
		min-height: 100vh; */
	}
</style>
