<script lang="ts">
	import BottomSheet from '@/components/BottomSheet.svelte';
	import Flex from '@/components/Flex.svelte';
	import { getGameHint } from '@/http/requests';
	import type { FourPicOneWordGameHintResponse } from '@/types/dugout';
	import { cn, extractAxiosResponseData } from '@/utils';
	import { createQuery } from '@tanstack/svelte-query';
	import { RefreshCcw, X } from 'lucide-svelte';
	import Spinner from '@/components/Spinner.svelte';
	import Highlighter from '@/highlighter';
	import toast from 'svelte-french-toast';

	export let selectedLetters: string[] = [];
	export let secretWord: string = '';
	export let gameId: string = '';
	export let onClose: () => void = () => {};
	export let isOpen: boolean = false;
	export let challengeId: string = '';

	let hintData: FourPicOneWordGameHintResponse | null = null;
	$: hintData = null;

	let hintRef: HTMLDivElement | null = null;

	$: getGameHintQuery = createQuery({
		queryKey: ['getGameHint', gameId, selectedLetters, secretWord, challengeId],
		queryFn: async () => {
			return await getGameHint({
				gameId: gameId,
				selectedLetters: selectedLetters,
				secretWord: secretWord,
				challengeId: challengeId
			});
		},
		enabled: isOpen,
		refetchOnMount: true,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false
	});

	$: {
		if ($getGameHintQuery.data) {
			const result = extractAxiosResponseData($getGameHintQuery.data, 'success')
				?.data as FourPicOneWordGameHintResponse;
			hintData = result;
		}

		if ($getGameHintQuery.isError) {
			console.log($getGameHintQuery.error);
			toast.error('Failed to get hint. Something went wrong.');
		}
	}
</script>

<BottomSheet
	{isOpen}
	showBackdrop={isOpen}
	showDragHandle={false}
	className="w-full h-auto min-h-[350px]  bg-gradient-to-b from-[#CDCBF2] to-[#CAC8F0]"
	showCloseButton={false}
>
	<Flex class="w-full h-full flex-center relative flex-col text-center px-10 pb-10">
		<button
			class={cn(
				'p-2 rounded-full bg-dark-103/5 hover:bg-dark-103/10 transition-colors stroke-dark-100 absolute top-0 left-0 enableBounceEffect',
				$getGameHintQuery.isFetching ? 'animate-pulse' : ''
			)}
			on:click={() => {
				$getGameHintQuery.refetch();
			}}
		>
			<RefreshCcw size={20} strokeWidth={2} class="stroke-blue-200" />
		</button>

		<button
			class={cn(
				'p-2 rounded-full bg-dark-103/5 hover:bg-dark-103/10 transition-colors stroke-dark-100 absolute top-0 right-0 enableBounceEffect'
			)}
			on:click={() => {
				onClose();
				hintData = null;
			}}
		>
			<X size={20} strokeWidth={4} class="stroke-blue-104" />
		</button>

		<h1 class="text-white text-2xl font-bold font-bruceforever py-5 text-blue-104">Hint</h1>
		{#if hintData && !$getGameHintQuery.isFetching && !$getGameHintQuery.isLoading}
			<!-- <div class="w-[300px] h-[300px] bg-[#81b6ff] blur-[100px] rounded-full" /> -->
			<br />

			<div class="text-start py-10 gap-0">
				{#if hintData?.hint}
					{@const higlightedHint = new Highlighter({
						text: hintData?.hint ?? '',
						keywords:
							hintData?.highlight_words?.map((word) => ({
								word: word,
								weight: 800,
								color: '#E4295D',
								borderStyle: 'solid',
								borderWidth: '2px',
								style: 'border-bottom'
							})) ?? [],
						options: { caseSensitive: true }
					})}
					<p
						class="text-white text-[1.2em] font-semibold font-jetbrains text-blue-104 leading-relaxed"
					>
						{@html higlightedHint?.highlight()}
					</p>
				{/if}
			</div>
			<br />
			<!-- tips section -->
			<div
				class="w-full h-auto py-3 px-3 rounded-lg bg-[#211a36] flex flex-col items-start justify-start text-start gap-2 pb-5"
			>
				<span class="text-white text-sm font-medium font-poppins text-white-100"> 💡 Tips: </span>
				{#each hintData?.tips as tip}
					<p class="text-white text-sm font-normal font-poppins text-white-100">
						{tip}
					</p>
				{/each}

				{#if hintData?.suggested_letters}
					<span class="text-white text-sm font-medium font-poppins text-white-100">
						💡 Suggested Letters: [{hintData?.suggested_letters.join(' - ')}]
					</span>
				{/if}
			</div>
		{:else}
			<!-- empty state -->
			<div class="w-full h-full flex-center relative flex-col text-center px-10 py-10">
				<!-- puzzle svg -->
				<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"
					><path
						fill="#b0b0af"
						d="M32.74 59.8c-.42-.42-25.99-6.05-25.99-6.05s-1.49 2.39-1.06 3.8c.24.79 5.82 7.28 11.56 13.25c4.53 4.72 9.68 9.52 10.43 12.26c1.15 4.22 1.27 10.99 1.27 10.99l-16.67 10.18s2.04 10.38 15.26 9.97c12.35-.38 12.99-13.46 16.91-13.53c.66-.01 1.57-.24 3.2 1.51c4.04 4.34 11.6 12.72 14.13 15.26c3.38 3.38 5.78 6.76 7.05 6.62s11.98-9.72 15.08-12.68s5.92-6.48 5.92-9.44s-4.37-5.21-4.37-5.21l-24.1 2.82zm70.88-38.18c.42 0 11.13-5.35 11.13-5.35s5.5 11.13-1.55 17.47s-8.6 2.75-11.98 6.48c-2.58 2.85-1.27 8.74-1.27 8.74L120.9 69.1s1.17 2.13.33 3.68c-.6 1.1-7.65 8.99-13.11 14.66c-2.46 2.55-5.89 3.41-7.75 2.96c-4.65-1.13-5.35-4.79-6.2-11.27s-6.43-6.38-8.46-6.06c-4.28.68-7.07 3.18-7.07 3.18s-25.2-30.37-24.92-31.22s1.27-7.19-1.69-9.86c-2.96-2.68-8.87-4.04-11.13-5.59c-2.25-1.55-2.55-4.5-2.14-7.36s18.63-2.83 18.63-2.83s31.42 17.33 31.57 16.63c.14-.74 14.66-14.4 14.66-14.4"
					/><radialGradient
						id="notoPuzzlePiece0"
						cx="62.172"
						cy="-28.3"
						r="119.225"
						gradientUnits="userSpaceOnUse"
						><stop offset=".508" stop-color="#5C7DDF" /><stop
							offset=".572"
							stop-color="#565FCA"
						/><stop offset=".643" stop-color="#5C7DDF" /><stop
							offset=".717"
							stop-color="#565FCA"
						/><stop offset=".793" stop-color="#5C7DDF" /><stop
							offset=".871"
							stop-color="#565FCA"
						/><stop offset=".949" stop-color="#565FCA" /><stop
							offset=".981"
							stop-color="#565FCA"
						/></radialGradient
					><path
						fill="url(#notoPuzzlePiece0)"
						d="M88.12 24.99c.76-2.78-.11-9.61 5.2-14.13s13.57-3.96 18.54.79s5.77 13.68-.11 19.56s-8.59 2.6-11.87 5.77s-2.71 5.77-.68 7.69c2.04 1.92 22.28 23.07 21.71 24.42s-14.36 16.96-16.62 18.09s-6.22 1.02-7.01-2.71s.57-11.19-5.09-13.12c-5.65-1.92-8.14-.34-13.68 5.54S70.48 89.21 75 92.49s10.18 1.92 12.44 5.77s-1.13 7.35-7.12 12.89s-10.63 10.06-11.42 9.5c-.79-.57-17.98-18.77-19.67-20.69c-1.7-1.92-4.98-3.62-8.14-.68c-3.17 2.94-3.73 12.55-17.07 12.55S9.08 97.36 13.83 91.37s15.26-6.56 15.49-10.63c.1-1.87-5.67-6.91-10.85-12.32C12.38 62.05 6.72 55.3 6.48 54.51c-.45-1.47 12.66-14.36 15.15-16.17s5.31-.68 6.67.79s1.7 5.99 2.83 8.59s6.44 13.91 19.22 1.02c12.66-12.78.68-18.32-3.39-19.45s-7-1.5-8.14-5.65c-.9-3.28 4.07-7.12 9.27-12.1s8.25-7.58 9.61-7.58s19.56 19.56 21.94 21.82s3.84 2.83 5.54 2.37c1.69-.44 2.6-1.91 2.94-3.16"
					/></svg
				>

				<!-- <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"
					><path
						fill="#b0b0af"
						d="M32.74 59.8c-.42-.42-25.99-6.05-25.99-6.05s-1.49 2.39-1.06 3.8c.24.79 5.82 7.28 11.56 13.25c4.53 4.72 9.68 9.52 10.43 12.26c1.15 4.22 1.27 10.99 1.27 10.99l-16.67 10.18s2.04 10.38 15.26 9.97c12.35-.38 12.99-13.46 16.91-13.53c.66-.01 1.57-.24 3.2 1.51c4.04 4.34 11.6 12.72 14.13 15.26c3.38 3.38 5.78 6.76 7.05 6.62s11.98-9.72 15.08-12.68s5.92-6.48 5.92-9.44s-4.37-5.21-4.37-5.21l-24.1 2.82zm70.88-38.18c.42 0 11.13-5.35 11.13-5.35s5.5 11.13-1.55 17.47s-8.6 2.75-11.98 6.48c-2.58 2.85-1.27 8.74-1.27 8.74L120.9 69.1s1.17 2.13.33 3.68c-.6 1.1-7.65 8.99-13.11 14.66c-2.46 2.55-5.89 3.41-7.75 2.96c-4.65-1.13-5.35-4.79-6.2-11.27s-6.43-6.38-8.46-6.06c-4.28.68-7.07 3.18-7.07 3.18s-25.2-30.37-24.92-31.22s1.27-7.19-1.69-9.86c-2.96-2.68-8.87-4.04-11.13-5.59c-2.25-1.55-2.55-4.5-2.14-7.36s18.63-2.83 18.63-2.83s31.42 17.33 31.57 16.63c.14-.74 14.66-14.4 14.66-14.4"
					/><radialGradient
						id="notoPuzzlePiece0"
						cx="62.172"
						cy="-28.3"
						r="119.225"
						gradientUnits="userSpaceOnUse"
						><stop offset=".508" stop-color="#b7d118" /><stop
							offset=".572"
							stop-color="#b2d019"
						/><stop offset=".643" stop-color="#a5cd1d" /><stop
							offset=".717"
							stop-color="#8fc922"
						/><stop offset=".793" stop-color="#70c22a" /><stop
							offset=".871"
							stop-color="#48ba34"
						/><stop offset=".949" stop-color="#18b040" /><stop
							offset=".981"
							stop-color="#02ab46"
						/></radialGradient
					><path
						fill="url(#notoPuzzlePiece0)"
						d="M88.12 24.99c.76-2.78-.11-9.61 5.2-14.13s13.57-3.96 18.54.79s5.77 13.68-.11 19.56s-8.59 2.6-11.87 5.77s-2.71 5.77-.68 7.69c2.04 1.92 22.28 23.07 21.71 24.42s-14.36 16.96-16.62 18.09s-6.22 1.02-7.01-2.71s.57-11.19-5.09-13.12c-5.65-1.92-8.14-.34-13.68 5.54S70.48 89.21 75 92.49s10.18 1.92 12.44 5.77s-1.13 7.35-7.12 12.89s-10.63 10.06-11.42 9.5c-.79-.57-17.98-18.77-19.67-20.69c-1.7-1.92-4.98-3.62-8.14-.68c-3.17 2.94-3.73 12.55-17.07 12.55S9.08 97.36 13.83 91.37s15.26-6.56 15.49-10.63c.1-1.87-5.67-6.91-10.85-12.32C12.38 62.05 6.72 55.3 6.48 54.51c-.45-1.47 12.66-14.36 15.15-16.17s5.31-.68 6.67.79s1.7 5.99 2.83 8.59s6.44 13.91 19.22 1.02c12.66-12.78.68-18.32-3.39-19.45s-7-1.5-8.14-5.65c-.9-3.28 4.07-7.12 9.27-12.1s8.25-7.58 9.61-7.58s19.56 19.56 21.94 21.82s3.84 2.83 5.54 2.37c1.69-.44 2.6-1.91 2.94-3.16"
					/></svg
				> -->

				<h1 class="text-white text-sm font-bold font-bruceforever py-5 text-blue-104">
					Discover the hint to crack the puzzle
				</h1>

				<br />

				{#if $getGameHintQuery.isFetching}
					<div class="flex-center w-full h-auto">
						<Spinner size="20" strokeWidth={'3'} className="stroke-[#211a36]" />
					</div>
				{/if}

				<!-- <ThreeDButton
					colorType="blue"
					className="w-full max-w-[180px] py-2 rounded-lg shadow-lg shadow-dark-100/20 disabled:opacity-70 disabled:cursor-not-allowed mt-10 flex-center"
					onClick={() => {
						$getGameHintMut.mutate({
							gameId: gameId,
							selectedLetters: selectedLetters,
							secretWord: secretWord,
							challengeId: challengeId
						});
					}}
					disabled={$getGameHintMut.isPending}
				>
					{#if $getGameHintMut.isPending}
						<Spinner size="20" strokeWidth={'3'} className="stroke-white-100" />
					{:else}
						<span class="text-white text-sm font-medium font-brunoace text-white-100">
							Continue
						</span>
					{/if}
				</ThreeDButton> -->
			</div>
		{/if}
	</Flex>
</BottomSheet>
