<script lang="ts">
	import Logo from '@/components/branding/Logo.svelte';
	import LogoWithText from '@/components/branding/LogoWithText.svelte';
	import Flex from '@/components/Flex.svelte';
	import Button from '@/components/ui/button.svelte';
	import { Bot, HandHeart, Tv } from 'lucide-svelte';

	export let nextStep: () => void;
</script>

<Flex className="w-full h-screen flex-col items-start justify-between gap-0">
	<Flex className="w-full h-auto absolute top-0 left-0 z-[1]">
		<div class="w-full h-[450px] rounded-full bg-dark-106/30 blur-[100px]" />
	</Flex>

	<Flex
		className="w-full h-full md:min-h-[50vh] max-h-[50vh] flex-col items-center justify-between flex-1 text-center z-[10]"
	>
		<div></div>
		<Flex className="w-full h-full flex-col items-center justify-center">
			<LogoWithText
				size={40}
				iconClassName="stroke-red-302 text-transparent"
				textClassName="text-red-302 font-montserrat font-bold text-1xl"
				strokeWidth={1.5}
				text="Clutch"
			/>
			<p class="text-white-200 font-poppins font-normal text-sm mt-4">Let get you started</p>
			<h1
				class="w-full max-w-[90vw] sm:max-w-[80vw] md:max-w-[70vw] lg:max-w-[60vw] font-brunoace font-semibold text-xl sm:text-3xl md:text-4xl lg:text-5xl text-white-100 mt-4"
			>
				Baseball Highlights, Reimagined
			</h1>
		</Flex>
	</Flex>

	<Flex className="w-full h-auto flex-col items-center justify-center px-[3em] ">
		<!-- feature section -->
		<Flex className="w-full h-auto flex-col items-start justify-start gap-[25px]">
			<Flex className="w-full h-auto flex-col items-start justify-start gap-1">
				<HandHeart size={30} class="stroke-red-302" />
				<h2 class="text-white-100 font-brunoace font-normal text-[13px] sm:text-sm md:text-lg mt-1">
					Personalized Feed
				</h2>
				<p class="text-white-300 font-montserrat font-light text-xs md:text-sm">
					Curated baseball moments based on your favorite teams.
				</p>
			</Flex>

			<Flex className="w-full h-auto flex-col items-start justify-start gap-1">
				<Bot size={30} class="stroke-red-302" />
				<h2 class="text-white-100 font-brunoace font-normal text-[13px] sm:text-sm md:text-lg mt-1">
					AI Companion
				</h2>
				<p class="text-white-300 font-montserrat font-light text-xs md:text-sm">
					Discuss highlights with our AI assistant to understand the game better
				</p>
			</Flex>

			<Flex className="w-full h-auto flex-col items-start justify-start gap-1">
				<Tv size={30} class="stroke-red-302" />
				<h2 class="text-white-100 font-brunoace font-normal text-[13px] sm:text-sm md:text-lg mt-1">
					News & Updates
				</h2>
				<p class="text-white-300 font-montserrat font-light text-xs md:text-sm">
					Keep up to date with the latest baseball news and updates
				</p>
			</Flex>

			<p class="text-white-300 font-montserrat font-light text-sm">... and much more</p>
		</Flex>

		<Button
			className="w-full h-[45px] mt-10 rounded-full bg-red-305 hover:bg-orange-303 text-white-100 font-montserrat font-semibold text-sm enableBounceEffect"
			on:click={nextStep}
		>
			Let's Go
		</Button>

		<br />
	</Flex>
</Flex>
