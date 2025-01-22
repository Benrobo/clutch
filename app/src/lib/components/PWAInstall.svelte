<script>
	import { onMount } from 'svelte';

	onMount(() => {
		navigator.serviceWorker.register('/service-worker.js');
	});
</script>