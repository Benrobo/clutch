<script lang="ts">
	import Flex from '@/components/Flex.svelte';
</script>

<svelte:head>
	<title>Spotlight</title>
</svelte:head>

<div class="w-screen h-screen mx-auto fixed top-0 left-0 flex-center bg-dark-103">
	<div class="w-full h-screen max-w-[678px] mx-auto flex flex-col relative">
		<!-- header -->
		<Flex
			className="w-full h-auto flex-row items-center justify-between px-4 py-5 absolute top-0 left-0 z-[3] border-b-[1px] border-white-400/30"
		></Flex>
	</div>
</div>
