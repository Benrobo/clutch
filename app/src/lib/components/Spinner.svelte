<script lang="ts">
	import type { ClassNameValue } from 'tailwind-merge';
	import { cn } from '$lib/utils';
	import Loader from 'lucide-svelte/icons/loader';

	export let className: ClassNameValue = '';
	export let size: string = '20';
	export let strokeWidth: string = '1.5';
</script>

<Loader class={cn('animate-spin', className)} {size} {strokeWidth} />
