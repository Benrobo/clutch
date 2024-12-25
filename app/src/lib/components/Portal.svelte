<script lang="ts">
	import { onMount } from 'svelte';
	import { tick } from 'svelte';

	let ref: HTMLElement;
	const target = document.body;

	onMount(() => {
		target.appendChild(ref);
		return () => {
			target.removeChild(ref);
		};
	});
</script>

<div bind:this={ref}>
	<slot />
</div>
