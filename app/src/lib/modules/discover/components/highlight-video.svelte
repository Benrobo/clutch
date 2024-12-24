<script lang="ts">
	import type { Highlight } from '@/types/highlights';
	import HighlightVideoPlayback from './highlight-video-playback.svelte';

	export let hl: Highlight;
	export let last_video_id: string | null = null;
	export let onObServedDataId: (id: string | null) => void = () => {};
</script>

<div class="video-container w-full h-[100vh] relative">
	<!-- thumbnail background -->
	<div class="w-full h-full absolute inset-0 z-[1]">
		<img
			src={hl?.thumbnail?.fallback}
			alt={hl?.playback?.title}
			class="w-full h-full object-cover opacity-[.50]"
		/>
	</div>

	<!-- main video section -->
	<div class="absolute inset-0 z-[2] backdrop-blur-xl bg-dark-103/30">
		<HighlightVideoPlayback
			highlight={hl}
			videoUrl={hl?.playback?.mlbVideoUrl}
			thumbnailUrl={hl?.thumbnail?.fallback}
			title={hl?.playback?.title}
			{last_video_id}
			onObServedDataId={(id) => {
				onObServedDataId(id);
			}}
		/>
	</div>
</div>

<style>
	.video-container {
		height: 100vh;
		min-height: 100vh;
	}
</style>
