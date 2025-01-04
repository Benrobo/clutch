<script lang="ts">
	import { cn } from '@/utils';
	import type { ClassValue } from 'tailwind-variants';

	export let className: ClassValue = '';
	export let colorType: 'orange' | 'blue' | 'pink' | 'hotpink' = 'orange';
	export let onClick: () => void = () => {};
	export let disabled: boolean = false;
</script>

<button
	class={cn(
		'w-auto h-auto',
		colorType === 'orange' &&
			'bg-gradient-to-b from-[#FFB32D] via-[#FD972B] to-[#FA8029] border-t-[3px] border-t-yellow-102 border-b-[6px] border-b-[#E85E1C] outline-2 outline outline-[#FFB32D]/90 active:brightness-90 active:translate-y-[2px] active:border-b-[3px] transition-all',
		colorType === 'blue' &&
			'bg-gradient-to-b from-[#6FA3F9] via-[#5D85EF] to-[#4F65E4] border-t-[3px] border-t-[#9BE4FF] border-b-[6px] border-b-[#3B47DC] outline-2 outline outline-[#4F65E4]/90 active:brightness-90 active:translate-y-[2px] active:border-b-[3px] transition-all',
		colorType === 'pink' &&
			'bg-gradient-to-b from-[#FD7FA5] to-[#E54376] border-t-[#FFD4FF] border-t-[2px] active:brightness-90 active:translate-y-[1px] active:border-t-[2px] transition-all drop-shadow-md shadow-dark-100',
		colorType === 'hotpink' &&
			'bg-gradient-to-b from-[#D61B44] to-[#DA205D] border-t-[#FFD4FF] border-t-[2px] active:brightness-90 active:translate-y-[1px] active:border-t-[2px] transition-all drop-shadow-md shadow-dark-100',
		className
	)}
	on:click={onClick}
	{disabled}
>
	<slot />
</button>
