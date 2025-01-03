<script lang="ts">
	import { page } from '$app/stores';
	import { quintOut } from 'svelte/easing';
	import { fade, fly } from 'svelte/transition';
	import WordSearch from '$lib/modules/dugout/components/WordSearch/index.svelte';
	import Quiz from '$lib/modules/dugout/components/Quiz/index.svelte';
	import FourPicOneWord from '$lib/modules/dugout/components/FourPicOneWord/index.svelte';

	const slug = $page.params.id;
</script>

<div class="w-screen h-screen" transition:fade={{ duration: 500, easing: quintOut }}>
	{#if slug === 'word-search'}
		<WordSearch />
	{:else if slug === 'quiz'}
		<Quiz />
	{:else if slug === '4-pic-one-word'}
		<FourPicOneWord />
	{/if}
</div>
