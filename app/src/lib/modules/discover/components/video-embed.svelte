<script lang="ts">
	import { onMount } from 'svelte';

	export let url: string = '';
</script>

<video
	id="my-video"
	class="video-js vjs-default-skin"
	controls
	preload="auto"
	width="640"
	height="360"
>
	<source src={url} type="video/mp4" />
</video>
