<script lang="ts">
	import Flex from '@/components/Flex.svelte';
	import { ChevronLeft } from 'lucide-svelte';
</script>

<div class="w-screen h-screen fixed inset-0 flex-center z-[999]">
	<div class="w-screen h-screen max-w-[600px] mx-auto bg-dark-103">
		<!-- topbar -->
		<Flex className="w-full h-auto bg-gray-102 items-center justify-between px-4 py-5">
			<button class="bg-gray-103 p-1 rounded-full flex-center">
				<ChevronLeft size={24} class="stroke-white-100" />
			</button>
			<div>
				<h1 class="text-white-100 font-medium text-lg">Chat</h1>
			</div>
			<button>
				<!-- <ChevronLeft size={24} class="stroke-white-100" /> -->
			</button>
		</Flex>

		<!-- bottom floating chatbox -->
		<div class="w-full fixed bottom-0 left-0">
			<Flex className="w-full h-auto bg-gray-103 items-center justify-between px-4 py-3"></Flex>
		</div>
	</div>
</div>
