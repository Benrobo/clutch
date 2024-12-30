<script lang="ts">
	import Flex from '@/components/Flex.svelte';
	import { ArrowRight, ChevronLeft, X } from 'lucide-svelte';
	import { fly, slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import Portal from '@/components/Portal.svelte';
	import { cn } from '@/utils';
	import { onMount } from 'svelte';
	import { authStore } from '@/store/auth.store';
	import AiResponse from './AIResponse.svelte';
	import { fakeMessages, fakeSources } from '@/data/chatfeed';

	export let chatId: string | null;
	export let onClose: () => void = () => {};

	$: userAvatar = $authStore?.user?.avatar;


	onMount(() => {});
</script>

{#if chatId}
	<Portal>
		<div
			id="chat-feed"
			class={cn(
				'w-full max-w-[643px] mx-auto h-[98vh] bg-dark-107',
				'transform transition-transform duration-500 ease-in-out fixed bottom-0 left-0 right-0 z-[999] rounded-t-[10px]',
				'flex flex-col overflow-hidden drop-shadow-2xl'
			)}
		>
			<div class="w-full mx-auto overflow-hidden">
				<!-- topbar -->
				<Flex className="w-full h-auto items-center justify-between px-4 pt-8 pb-3">
					<button
						class="p-[6px] bg-dark-106 rounded-full flex-center enableBounceEffect"
						on:click={onClose}
					>
						<X size={20} class="stroke-white-100" strokeWidth={2} />
					</button>
					<div>
						<h1 class="text-white-100 font-medium text-lg">Chat</h1>
					</div>
					<button>
						<!-- <ChevronLeft size={24} class="stroke-white-100" /> -->
					</button>
				</Flex>

				<!-- chat feed -->
				<div class="w-full h-screen overflow-y-auto pb-[20em] px-5 py-3 hideScrollBar2">
					{#each fakeMessages as msg}
						<!-- ai response -->
						{#if msg.role === 'ai'}
							{@const sources = msg.sources?.map((idx) => fakeSources[idx]) ?? []}
							<AiResponse answer={msg.content} {sources} />
						{:else}
							<!-- human response -->
							<Flex className="w-full h-auto flex-col gap-3 my-10">
								<Flex className="w-full h-auto flex-row items-center">
									<img
										src={$authStore?.user?.avatar}
										class="w-[20px] h-[20px] rounded-full bg-white-100"
										alt="favicon"
										on:error={(e) => {
											userAvatar = `https://api.dicebear.com/6.x/micah/svg?seed=${$authStore?.user?.email}`;
										}}
									/>
									<div class="w-full h-auto">
										<span class="text-white-200 font-poppins font-normal text-sm sm:text-lg">
											{msg?.content}
										</span>
									</div>
								</Flex>
							</Flex>
						{/if}
					{/each}
				</div>

				<!-- bottom floating chatbox -->
				<div
					class="w-full min-h-[80px] px-8 py-3 absolute bottom-0 left-0 bg-dark-100/10 backdrop-blur-sm"
				>
					<Flex
						className="w-full h-[50px] bg-dark-106 items-center justify-between pl-4 pr-1 rounded-full border-[1px] border-gray-101/50 shadow-md shadow-dark-100 scale-[1.05]"
					>
						<input
							type="text"
							placeholder="Ask me anything about this highlight..."
							class="w-full h-full py-3 bg-transparent text-white-200 font-recoleta font-normal text-sm border-none outline-none ring-0 focus:border-none focus:ring-0 placeholder:text-white-200/90"
						/>

						<button class="w-[38px] min-w-[38px] h-[38px] bg-gray-101 rounded-full flex-center">
							<ArrowRight />
						</button>
					</Flex>
				</div>
			</div>
		</div>
	</Portal>
{/if}

<style>
	#chat-feed {
		animation: slide-in-bottom 0.1s ease-in-out forwards;
	}

	@keyframes slide-in-bottom {
		0% {
			transform: translateY(1000px);
			/* opacity: 0; */
		}
		100% {
			transform: translateY(0);
			/* opacity: 1; */
		}
	}
</style>
