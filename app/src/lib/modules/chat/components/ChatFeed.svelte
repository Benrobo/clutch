<script lang="ts">
	import Flex from '@/components/Flex.svelte';
	import { ArrowRight, X } from 'lucide-svelte';
	import Portal from '@/components/Portal.svelte';
	import { cn, extractAxiosResponseData } from '@/utils';
	import { onMount } from 'svelte';
	import { authStore } from '@/store/auth.store';
	import AiResponse from './AIResponse.svelte';
	import { useChatFeedStore } from '@/store/chatfeed.store';
	import ChatLoading from './loaders/ChatLoading.svelte';
	import AnswerLoading from './loaders/AnswerLoading.svelte';
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import {
		getChatMessages,
		processLastMsg,
		processLastMsgLocal,
		sendMessage
	} from '@/http/requests';
	import type { ChatMessagesResponse, ProcessLastMessageResponse } from '@/types/chatfeed';
	import Spinner from '@/components/Spinner.svelte';
	import EmptyChat from './EmptyChat.svelte';
	import HighlightConversationService from '@/services/highlight-conversation';
	import type { ChatMessage } from '@/services/db';

	export let onClose: () => void = () => {};
	export let pbId: string = '';

	const highlightConversationService = new HighlightConversationService();

	let scrollElement: HTMLElement | null;
	let chatMessages: ChatMessagesResponse[] | ChatMessage[] = [];
	let message: string = '';

	$: chatFeedStore = useChatFeedStore();
	$: chatId = $chatFeedStore?.activeConversation?.id;
	$: userAvatar = $authStore?.user?.avatar;

	$: chatMessages = [];

	$: processingLastMsg = false;

	// SERVER RELATED QUERIES
	// Get chat messages from server (CURRENTLY NOT IN USE)
	// Leaving this here for future reference
	$: getMessagesQuery = createQuery({
		queryKey: ['getMessages', chatId],
		queryFn: async () => await getChatMessages(chatId!),
		enabled: !!chatId
	});

	// Send message to server
	$: sendMessageMutation = createMutation({
		mutationFn: async (message: string) => await sendMessage(chatId!, message),
		onSuccess: (data) => {
			const resp = extractAxiosResponseData(data, 'success')?.data as unknown as {
				user: ChatMessagesResponse;
			};
			chatMessages = [...chatMessages, resp?.user] as ChatMessagesResponse[];
			processingLastMsg = true;
			$processLastMsgMut.mutate();
			scrollToBottom();
		},
		onError: (error) => {
			processingLastMsg = false;
			console.error(error);
		}
	});

	// process last message from server (CURRENTLY NOT IN USE)
	// Leaving this here for future reference
	$: processLastMsgMut = createMutation({
		mutationFn: async () => {
			processingLastMsg = true;
			const resp = await processLastMsg(chatId!);
			return resp;
		},
		onSuccess: (data) => {
			processingLastMsg = false;
			const resp = extractAxiosResponseData(data, 'success')?.data as unknown as {
				ai: ChatMessagesResponse;
			};
			chatMessages = [...chatMessages, resp?.ai] as ChatMessagesResponse[];
		},
		onError: (error) => {
			processingLastMsg = false;
			console.error(error);
		}
	});

	// LOCAL RELATED QUERIES
	// process last message from local (CURRENTLY IN USE)
	$: processLastMsgLocalMut = createMutation({
		mutationFn: async (payload: { last_message: string; pbId: string }) =>
			await processLastMsgLocal(payload),
		onSuccess: async (data) => {
			const resp = extractAxiosResponseData(data, 'success')
				?.data as unknown as ProcessLastMessageResponse;
			console.log({ resp });

			// save to local db
			const chat = await highlightConversationService.getChat(pbId!);
			await highlightConversationService.addChatMessage({
				chat_id: chat?.id!,
				role: 'AI',
				content: resp?.ai?.message,
				sources: resp?.ai?.sources
			});

			await getLocalChatMessages();

			fetchingAIResponse = false;
		},
		onError: (error) => {
			fetchingAIResponse = false;
			console.error(error);
		}
	});

	// $: fetchingChatMessages = $getMessagesQuery.isLoading;
	$: fetchingChatMessages = false;
	$: fetchingAIResponse = processingLastMsg || $processLastMsgMut.isPending;

	$: scrollElement = null;

	const scrollToBottom = () => {
		if (scrollElement) {
			scrollElement.scrollIntoView({ behavior: 'smooth' });
		}
	};

	const getLocalChatMessages = async () => {
		const chat = await highlightConversationService.getChat(pbId!);
		const messages = await highlightConversationService.getChatMessages(chat?.id!);
		console.log({ messages });
		chatMessages = messages;
	};

	const sendMessageLocal = async (message: string) => {
		const chat = await highlightConversationService.getChat(pbId!);
		if (!chat) {
			await highlightConversationService.createChat({
				ref: pbId!,
				ref_type: 'highlight_playback',
				title: 'Highlight Conversation'
			});
		}

		await highlightConversationService.addChatMessage({
			chat_id: chat?.id!,
			role: 'USER',
			content: message
		});

		await getLocalChatMessages();

		fetchingAIResponse = true;

		$processLastMsgLocalMut.mutate({ last_message: message, pbId: pbId! });
	};

	$: if (chatMessages.length > 0) {
		// Small delay to ensure content is rendered
		setTimeout(scrollToBottom, 100);
	}

	// $: if ($getMessagesQuery.data) {
	// 	const data = extractAxiosResponseData($getMessagesQuery.data, 'success')
	// 		?.data as unknown as ChatMessagesResponse[];
	// 	chatMessages = data;
	// }

	onMount(() => {
		scrollToBottom();
		getLocalChatMessages();

		if (document) {
			document.getElementById('chat-input')?.addEventListener('keydown', async (e) => {
				if (e.key === 'Enter') {
					e.preventDefault();
					if (message.trim().length === 0) return;
					// $sendMessageMutation.mutate(message);
					await sendMessageLocal(message);
					message = '';
				}
			});
		}
	});
</script>

{#if chatId}
	<Portal>
		<div
			id="chat-feed"
			class={cn(
				'w-full max-w-[678px] mx-auto h-[98vh] bg-dark-107',
				'transform transition-transform duration-500 ease-in-out fixed bottom-0 left-0 right-0 z-[999999] rounded-t-[10px]',
				'flex flex-col overflow-hidden drop-shadow-2xl'
			)}
		>
			<div class="w-full mx-auto overflow-hidden">
				<!-- topbar -->
				<Flex
					className="w-full h-auto items-center justify-between px-4 pt-8 pb-3 absolute top-0 left-0 z-[3]"
				>
					<button
						class="p-[6px] bg-dark-106 rounded-full flex-center enableBounceEffect"
						on:click={onClose}
					>
						<X size={20} class="stroke-white-100" strokeWidth={2} />
					</button>
					<div>
						<h1 class="text-white-100 font-light font-garamond text-xl">
							{$chatFeedStore?.activeConversation?.title}
						</h1>
					</div>
					<button>
						<!-- <ChevronLeft size={24} class="stroke-white-100" /> -->
					</button>
				</Flex>

				<!-- chat feed -->
				<div
					class="w-full h-screen flex flex-col overflow-y-scroll pb-[10em] pt-[8em] px-5 py-10 hideScrollBar2 gap-10"
				>
					{#if !fetchingAIResponse && chatMessages.length === 0}
						<EmptyChat />
					{/if}

					{#if !fetchingChatMessages && chatMessages.length > 0}
						{#each chatMessages as msg}
							{#if msg?.role === 'USER'}
								<Flex className="w-full h-auto flex-col gap-3">
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
											<span class="text-white-200 font-poppins font-normal text-sm sm:text-sm">
												{msg?.content}
											</span>
										</div>
									</Flex>
								</Flex>
							{:else if msg?.role === 'AI'}
								<AiResponse answer={msg.content} sources={msg?.sources?.slice(0, 5)} />
							{/if}
						{/each}
					{/if}

					{#if fetchingChatMessages}
						<ChatLoading />
					{/if}

					{#if fetchingAIResponse}
						<AnswerLoading />
					{/if}

					<div bind:this={scrollElement} />
				</div>

				<!-- bottom floating chatbox -->
				<div
					class="w-full min-h-[80px] px-8 py-3 pb-10 absolute bottom-0 left-0 z-[3] bg-dark-100/10 backdrop-blur-sm"
				>
					<Flex
						className="w-full h-[50px] bg-dark-106 items-center justify-between pl-4 pr-1 rounded-full border-[1px] border-gray-101/50 shadow-md shadow-dark-100 scale-[1.05]"
					>
						<input
							id="chat-input"
							type="text"
							aria-label="Chat Input"
							placeholder="Ask me anything about this highlight..."
							class="w-full h-full py-3 bg-transparent text-white-200 font-garamond font-light text-md border-none outline-none ring-0 focus:border-none focus:ring-0 placeholder:text-white-200/50 disabled:cursor-not-allowed disabled:opacity-50"
							bind:value={message}
							on:keydown={async (e) => {
								if (e.key === 'Enter') {
									e.preventDefault();
									if (message.trim().length === 0) return;
									// $sendMessageMutation.mutate(message);
									await sendMessageLocal(message);
									message = '';
								}
							}}
						/>
						<!-- SERVER RELATED 👆 -->
						<!-- disabled={$sendMessageMutation.isPending} -->

						<button
							class="w-[38px] min-w-[38px] h-[38px] bg-gray-101 rounded-full flex-center disabled:opacity-50 disabled:cursor-not-allowed enableBounceEffect cursor-pointer"
							disabled={$processLastMsgMut?.isPending}
							on:click={async () => {
								if (message.trim().length === 0) return;
								// $sendMessageMutation.mutate(message);
								await sendMessageLocal(message);
								message = '';
							}}
						>
							{#if $sendMessageMutation.isPending}
								<Spinner size={'20'} />
							{:else}
								<ArrowRight size={18} />
							{/if}
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
