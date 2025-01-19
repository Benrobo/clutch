<script lang="ts">
	import Logo from '@/components/branding/Logo.svelte';
	import Flex from '@/components/Flex.svelte';
</script>

<Flex className="w-full h-auto flex-col mt-7">
	<Flex className="w-full h-auto flex-row items-center">
		<span class="p-1 rounded-full bg-dark-106">
			<Logo size={18} className="stroke-red-302 text-red-302" />
		</span>
		<h1 class="text-white-200 font-garamond font-normal text-lg">Answer</h1>
	</Flex>

	<!-- answer content loader -->
	<Flex className="w-full flex-col">
		<div class="w-full max-w-[678px] h-[10px] rounded-full bg-gray-101/20 animate-pulse"></div>
		<div class="w-full max-w-[450px] h-[10px] rounded-full bg-gray-101/20 animate-pulse"></div>
		<div class="w-full max-w-[350px] h-[10px] rounded-full bg-gray-101/20 animate-pulse"></div>
		<div class="w-full max-w-[250px] h-[10px] rounded-full bg-gray-101/20 animate-pulse"></div>
	</Flex>
</Flex>
