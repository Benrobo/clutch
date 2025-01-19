<script lang="ts">
	import Flex from '@/components/Flex.svelte';
	import { logout } from '@/http/requests';
	import { authStore } from '@/store/auth.store';
	import { createMutation } from '@tanstack/svelte-query';
	import toast from 'svelte-french-toast';

	$: logoutMut = createMutation({
		mutationFn: logout,
		onSuccess: () => {
			window.location.href = '/';
		},
		onError: () => {
			toast.error('Failed to logout');
		}
	});
</script>

<svelte:head>
	<title>Clutch - Profile</title>
	<meta name="description" content="User profile" />
</svelte:head>

<Flex className="w-full h-screen items-center justify-center px-10">
	<div class="w-full h-auto pt-10 py-10 rounded-xl flex flex-col items-center justify-center">
		<img
			src={$authStore?.user?.avatar}
			class="w-[150px] h-[150px] rounded-full"
			alt="avatar"
			on:error={(e) => {
				// @ts-expect-error
				e.currentTarget.src = '/baseball.png';
			}}
		/>

		<div class="w-full h-auto flex flex-col items-center justify-center gap-1 mt-6">
			<span class="text-white-100 font-brunoace font-semibold text-lg">
				{$authStore?.user?.name ?? '---'}
			</span>

			<span class="text-white-300 font-poppins font-light text-sm">
				{$authStore?.user?.email ?? '---'}
			</span>
		</div>
		<br />
		<br />
		<div class="w-full px-10 flex-center">
			<button
				class="w-full max-w-[250px] px-3 py-2 rounded-full bg-red-305 border-[1px] border-white-400/30 enableBounceEffect"
				on:click={() => $logoutMut.mutate()}
			>
				<span class="text-white-100 font-poppins font-light text-sm"> Logout </span>
			</button>
		</div>
	</div>
</Flex>
