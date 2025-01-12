<script lang="ts">
	import { cn } from '@/utils';
	import type { ClassValue } from 'tailwind-variants';

	export let name: keyof typeof icons;
	export let size = '1rem';
	export let focusable: string | number | null | undefined = undefined;
	export let className: ClassValue = '';
	let icons = {
		'lighting-bolt': {
			box: 560.316,
			svg: `<path d="M207.523,560.316c0,0,194.42-421.925,194.444-421.986l10.79-23.997c-41.824,12.02-135.271,34.902-135.57,35.833
			C286.96,122.816,329.017,0,330.829,0c-39.976,0-79.952,0-119.927,0l-12.167,57.938l-51.176,209.995l135.191-36.806
			L207.523,560.316z"/>`
		}
	} as const;
	let displayIcon = icons[name];
</script>

<svg
	class={cn(className)}
	{focusable}
	width={size}
	height={size}
	viewBox={`0 0 ${displayIcon.box} ${displayIcon.box}`}
	xml:space="preserve"
>
	{@html displayIcon.svg}
</svg>
