<script lang="ts">
	import { Clock } from 'lucide-svelte';
	import Flex from '@/components/Flex.svelte';
	import { cn } from '@/utils';

	export let thumbnail: string;
	export let title: string;
	export let description: string;
	export let readingTime: { min: number; sec: number };
	export let onClick: () => void = () => {};
</script>

<button
	class="w-full h-auto flex flex-col gap-3 bg-dark-106 cursor-pointer rounded-lg"
	on:click={onClick}
>
	<div class="w-full aspect-video rounded-t-lg overflow-hidden">
		<img src={thumbnail} alt={title} class="w-full h-full object-cover bg-dark-100" />
	</div>
	<div class="flex flex-col gap-1 pt-3 px-3 pb-3 text-start">
		<h2 class={cn('text-white-100 text-lg font-medium', title.length > 60 ? 'text-md' : '')}>
			{title}
		</h2>
		<p class="text-white-400 text-sm">{description}</p>
		<Flex className="flex-row gap-1 mt-3 items-center">
			<Clock size={14} class="text-white-400" />
			<span class="text-white-400 text-xs">{readingTime.min} min read</span>
		</Flex>
	</div>
</button>
