<script lang="ts">
	import BottomSheet from '@/components/BottomSheet.svelte';
	import Flex from '@/components/Flex.svelte';
	import Notfound from '@/modules/matchup/components/Notfound.svelte';
	import PlayersCardInfo from '@/modules/matchup/components/PlayersCardInfo.svelte';
	import type { Player } from '@/types/matchup';
	import { cn } from '@/utils';
	import { X } from 'lucide-svelte';
	import { afterUpdate } from 'svelte';
</script>

<BottomSheet
	isOpen={true}
	showBackdrop={false}
	showCloseButton={true}
	rounded={false}
	showDragHandle={false}
	className="w-full min-h-[100vh] bg-dark-109"
></BottomSheet>
