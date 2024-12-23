<script>
	import { page } from '$app/stores';
	import Flex from '$lib/components/Flex.svelte';
</script>

<Flex className="flex-col items-center justify-center h-screen bg-dark-102">
	<h1 class="text-md font-bold">It seems there has been an error, sorry about that.</h1>
	{#if $page?.error}
		<div class="mt-4 border-y-2 p-4">
			{#if $page?.status}
				<p>Page status: {$page?.status}</p>
			{/if}
			{#if $page?.error?.message}
				<p>Error message: {$page?.error?.message}</p>
			{/if}
		</div>
	{/if}
</Flex>
