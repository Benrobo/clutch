<script lang="ts">
	import BottomSheet from '@/components/BottomSheet.svelte';
	import Flex from '@/components/Flex.svelte';
	import Notfound from '@/modules/matchup/components/Notfound.svelte';
	import PlayersCardInfo from '@/modules/matchup/components/PlayersCardInfo.svelte';
	import type { Player } from '@/types/matchup';
	import { cn } from '@/utils';
	import { X } from 'lucide-svelte';
	import { afterUpdate } from 'svelte';
	import VersusOverview from './VersusOverview.svelte';
</script>

<!-- <div class="w-screen h-screen"> -->
<BottomSheet
	showHeader={false}
	isOpen={true}
	showBackdrop={false}
	showCloseButton={false}
	rounded={false}
	showDragHandle={false}
	className="w-[100vw] h-[100vh] overflow-hidden bg-dark-109"
	contentClassName="px-0 py-0"
>
	<div class="w-full h-screen relative">
		<VersusOverview title="Versus Overview-1" />
		<!-- <VersusOverview title="Versus Overview-2" /> -->
	</div>
</BottomSheet>
<!-- </div> -->
