<script lang="ts">
	import Flex from '@/components/Flex.svelte';
	import useDetectDevice from '@/hooks/useDetectDevice';
	import { afterUpdate } from 'svelte';
	import AnswerLoading from './AnswerLoading.svelte';
</script>

<Flex className="w-full h-auto flex-col gap-4">
	<!-- sources shimmer animation -->
	<!-- desktop -->
	<Flex
		className="w-full h-auto hidden md:flex lg:flex flex-row items-center gap-3 overflow-hidden"
	>
		{#each Array(4) as _}
			<div
				class="w-full h-[36px] bg-dark-106 border-[.5px] border-white-400/30 flex flex-row items-center justify-center flex-nowrap gap-2 px-[5px] py-[4px] rounded-full animate-pulse"
			>
				<div class="min-w-[30px] h-full rounded-full bg-gray-101/20" />
				<div class="w-full min-h-[10px] rounded-full bg-gray-101/20" />
			</div>
		{/each}
	</Flex>

	<!-- mobile -->
	<Flex className="w-full h-auto md:hidden lg:hidden flex-row items-center gap-3 overflow-hidden">
		{#each Array(3) as _}
			<div
				class="w-full h-[36px] bg-dark-106 border-[.5px] border-white-400/30 flex flex-row items-center justify-center flex-nowrap gap-2 px-[5px] py-[4px] rounded-full animate-pulse"
			>
				<div class="min-w-[30px] h-full rounded-full bg-gray-101/20" />
				<div class="w-full min-h-[10px] rounded-full bg-gray-101/20" />
			</div>
		{/each}
	</Flex>

	<AnswerLoading />
</Flex>
