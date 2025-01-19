<script lang="ts">
	import Logo from '@/components/branding/Logo.svelte';
	import LogoWithText from '@/components/branding/LogoWithText.svelte';
	import Flex from '@/components/Flex.svelte';
	import type { ChatFeedSources } from '@/types/chatfeed';
	import { Pickaxe } from 'lucide-svelte';

	export let answer: string;
	export let sources: ChatFeedSources[] | null = [];
</script>

<Flex className="w-full h-auto flex-col gap-4">
	<!-- sources sections -->
	<Flex className="w-full h-auto flex-col">
		{#if sources && sources.length > 0}
			<Flex className="w-full h-auto flex-row items-center">
				<Pickaxe size={18} class="stroke-white-200" />
				<h1 class="text-white-200 font-garamond font-normal text-md">Sources</h1>
			</Flex>
			<div
				class="w-fit h-auto flex flex-row items-start justify-start gap-3 overflow-x-hidden mt-2 hideScrollBar2 whitespace-nowrap relative"
			>
				{#each sources as src}
					<!-- <Flex
					className="w-full h-[100px] flex-row items-center justify-between bg-dark-106 p-2 rounded-md"
				>
					<Flex className="w-full h-auto flex-col">
						<img
							src={src.seo?.favicon}
							class="w-[20px] h-[20px] rounded-full bg-white-100"
							alt="favicon"
						/>
						<h1 class="text-white-100 font-garamond font-normal text-sm">{src?.description}</h1>
					</Flex>
					<Flex className="w-auto h-auto flex-col items-end">
						<img src={src?.image} class="w-[250px] rounded-md" alt="source" />
				</Flex>
				</Flex> -->
					<a href={src?.url} target="_blank" class="w-auto whitespace-nowrap">
						<Flex
							className="w-auto px-2 py-2 rounded-full bg-dark-106 border-[.5px] border-white-400/30 flex-center"
						>
							<img
								src={src?.favicon}
								class="w-[17px] h-[17px] rounded-full bg-white-100"
								alt="favicon"
							/>
							<h1 class="text-white-300 font-garamond font-normal text-[12px]">
								{src?.domain}
							</h1>
						</Flex>
					</a>
				{/each}
			</div>
		{/if}
	</Flex>

	<!-- answer -->
	<Flex className="w-full h-auto flex-col mt-1">
		<Flex className="w-full h-auto flex-row items-center">
			<span class="p-1 rounded-full bg-dark-106">
				<Logo size={18} className="stroke-red-302 text-red-302" />
			</span>
			<h1 class="text-white-200 font-garamond font-normal text-lg">Answer</h1>
		</Flex>

		<!-- answer content -->
		<div class="w-full h-auto">
			<span class="text-white-100 font-garamond font-light text-md sm:text-lg">
				{answer}
			</span>
		</div>
	</Flex>
</Flex>
