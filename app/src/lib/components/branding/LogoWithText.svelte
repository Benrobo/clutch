<script lang="ts">
	import { cn } from '@/utils';
	import type { ClassValue } from 'tailwind-variants';
	import Flex from '../Flex.svelte';
	import Logo from './Logo.svelte';

	export let iconClassName: ClassValue = null;
	export let textClassName: ClassValue = null;
	export let style: string | null = null;
	export let size: number | null = null;
	export let strokeWidth: number | null = null;
	export let text: string | null = null;
</script>

<Flex className="w-full h-auto items-center justify-center text-center">
	<Logo {size} className={iconClassName} {style} {strokeWidth} />
	<h1 class={cn(textClassName)}>
		{#if text}
			{text}
		{/if}
	</h1>
</Flex>
