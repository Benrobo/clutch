<script lang="ts">
	import Logo from '@/components/branding/Logo.svelte';
	import LogoWithText from '@/components/branding/LogoWithText.svelte';
	import Flex from '@/components/Flex.svelte';
	import Button from '@/components/ui/button.svelte';
	import { Bot, HandHeart, Tv } from 'lucide-svelte';
	import env from '@/config/env';
	import { page } from '$app/stores';
	import toast from 'svelte-french-toast';
	import { authStore } from '@/store/auth.store';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import AuthLayout from '@/components/AuthLayout.svelte';

	const errorMap = {
		email_not_found: 'Email not found',
		google_auth_failed: 'Google Auth failed'
	};

	$: error = $page.url.searchParams.get('error');

	$: {
		if (error) {
			if (errorMap[error as keyof typeof errorMap]) {
				toast.error(errorMap[error as keyof typeof errorMap]);
			} else {
				toast.error('Something went wrong');
			}
		}
	}
</script>

<svelte:head>
	<title>Clutch</title>
	<meta name="description" content="Baseball Reimagined" />
</svelte:head>

<AuthLayout>
	<Flex
		className="w-full max-w-[678px] mx-auto h-screen flex-col items-start justify-between gap-0"
	>
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
				<h1
					class="w-full max-w-[90vw] sm:max-w-[80vw] md:max-w-[70vw] lg:max-w-[60vw] font-brunoace font-semibold text-xl sm:text-3xl md:text-4xl lg:text-5xl text-white-100 mt-2"
				>
					Baseball Highlights, Reimagined
				</h1>
				<p class="text-white-200 font-poppins font-light text-xs mt-4">
					Your game, your way. Log in to experience baseball like never before.
				</p>
			</Flex>
		</Flex>

		<Flex className="w-full h-auto flex-col items-center justify-center px-[3em] ">
			<!-- feature section -->
			<Flex className="w-full h-auto flex-col items-start justify-start gap-[25px]">
				<Flex className="w-full h-auto flex-col items-start justify-start gap-1">
					<HandHeart size={30} class="stroke-red-302" />
					<h2
						class="text-white-100 font-brunoace font-normal text-[13px] sm:text-sm md:text-lg mt-1"
					>
						Personalized Feed
					</h2>
					<p class="text-white-300 font-montserrat font-light text-xs md:text-sm">
						Curated baseball moments based on your favorite teams.
					</p>
				</Flex>

				<Flex className="w-full h-auto flex-col items-start justify-start gap-1">
					<Bot size={30} class="stroke-red-302" />
					<h2
						class="text-white-100 font-brunoace font-normal text-[13px] sm:text-sm md:text-lg mt-1"
					>
						AI Companion
					</h2>
					<p class="text-white-300 font-montserrat font-light text-xs md:text-sm">
						Discuss highlights with our AI assistant to understand the game better
					</p>
				</Flex>

				<Flex className="w-full h-auto flex-col items-start justify-start gap-1">
					<Tv size={30} class="stroke-red-302" />
					<h2
						class="text-white-100 font-brunoace font-normal text-[13px] sm:text-sm md:text-lg mt-1"
					>
						News & Updates
					</h2>
					<p class="text-white-300 font-montserrat font-light text-xs md:text-sm">
						Keep up to date with the latest baseball news and updates
					</p>
				</Flex>

				<p class="text-white-300 font-montserrat font-light text-sm">... and much more</p>
			</Flex>

			<a href={env.apiUrl + '/api/auth/google'} class="w-full">
				<Button
					className="w-full h-[50px] mt-10 py-3 rounded-full border-[2px] bg-dark-106/30 border-red-305 hover:bg-dark-100/50  text-white-100 font-montserrat font-semibold text-sm enableBounceEffect gap-3"
				>
					<span>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 128 128"
							class="grayscale2"
							><path
								fill="#fff"
								d="M44.59 4.21a63.28 63.28 0 0 0 4.33 120.9a67.6 67.6 0 0 0 32.36.35a57.13 57.13 0 0 0 25.9-13.46a57.44 57.44 0 0 0 16-26.26a74.3 74.3 0 0 0 1.61-33.58H65.27v24.69h34.47a29.72 29.72 0 0 1-12.66 19.52a36.2 36.2 0 0 1-13.93 5.5a41.3 41.3 0 0 1-15.1 0A37.2 37.2 0 0 1 44 95.74a39.3 39.3 0 0 1-14.5-19.42a38.3 38.3 0 0 1 0-24.63a39.25 39.25 0 0 1 9.18-14.91A37.17 37.17 0 0 1 76.13 27a34.3 34.3 0 0 1 13.64 8q5.83-5.8 11.64-11.63c2-2.09 4.18-4.08 6.15-6.22A61.2 61.2 0 0 0 87.2 4.59a64 64 0 0 0-42.61-.38"
							/><path
								fill="#e33629"
								d="M44.59 4.21a64 64 0 0 1 42.61.37a61.2 61.2 0 0 1 20.35 12.62c-2 2.14-4.11 4.14-6.15 6.22Q95.58 29.23 89.77 35a34.3 34.3 0 0 0-13.64-8a37.17 37.17 0 0 0-37.46 9.74a39.25 39.25 0 0 0-9.18 14.91L8.76 35.6A63.53 63.53 0 0 1 44.59 4.21"
							/><path
								fill="#f8bd00"
								d="M3.26 51.5a63 63 0 0 1 5.5-15.9l20.73 16.09a38.3 38.3 0 0 0 0 24.63q-10.36 8-20.73 16.08a63.33 63.33 0 0 1-5.5-40.9"
							/><path
								fill="#587dbd"
								d="M65.27 52.15h59.52a74.3 74.3 0 0 1-1.61 33.58a57.44 57.44 0 0 1-16 26.26c-6.69-5.22-13.41-10.4-20.1-15.62a29.72 29.72 0 0 0 12.66-19.54H65.27c-.01-8.22 0-16.45 0-24.68"
							/><path
								fill="#319f43"
								d="M8.75 92.4q10.37-8 20.73-16.08A39.3 39.3 0 0 0 44 95.74a37.2 37.2 0 0 0 14.08 6.08a41.3 41.3 0 0 0 15.1 0a36.2 36.2 0 0 0 13.93-5.5c6.69 5.22 13.41 10.4 20.1 15.62a57.13 57.13 0 0 1-25.9 13.47a67.6 67.6 0 0 1-32.36-.35a63 63 0 0 1-23-11.59A63.7 63.7 0 0 1 8.75 92.4"
							/></svg
						>
					</span>
					<span class="text-white-100 font-poppins font-semibold text-sm">
						Continue With Google
					</span>
				</Button>
			</a>

			<span class="text-white-300 font-montserrat font-light text-xs mt-4">
				Install the PWA to get the best experience
			</span>

			<br />
		</Flex>
	</Flex>
</AuthLayout>
