<script lang="ts">
	import { goto } from '$app/navigation';
	import Flex from '@/components/Flex.svelte';
	import Button from '@/components/ui/button.svelte';
	import { hasPreference, savePreference } from '@/http/requests';
	import MainScreen from '@/modules/onboarding/components/MainScreen.svelte';
	import SelectTeams from '@/modules/onboarding/components/SelectTeams.svelte';
	import type { SavePreference } from '@/types/games';
	import { extractAxiosResponseData } from '@/utils';
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import toast from 'svelte-french-toast';

	let selectedTeams: number[] = [];
	$: selectedTeams = [];
	$: steps = 1;

	$: savePreferenceMut = createMutation({
		mutationFn: async (data: SavePreference) => await savePreference(data),
		onSuccess: (data) => {
			toast.success('Preference saved');
			goto('/home/feed');
		},
		onError: (error: any) => {
			console.error(error);
		}
	});

	$: checkUserHasPreference = createQuery({
		queryKey: ['has-preference'],
		queryFn: async () => await hasPreference()
	});

	$: if ($checkUserHasPreference.data) {
		const data = extractAxiosResponseData($checkUserHasPreference.data, 'success')
			?.data as unknown as { hasPreference: boolean };

		if (data.hasPreference) {
			// goto('/home/feed');
		}
	}

	$: isLoading = $checkUserHasPreference.isLoading;
</script>

{#if steps === 1 || isLoading}
	<MainScreen
		nextStep={() => {
			steps += 1;
		}}
	/>
{:else}
	{#if steps === 2}
		<SelectTeams
			onTeamSelect={(team) => {
				selectedTeams = team;
			}}
		/>
	{/if}

	<!-- control buttons -->
	{#if steps > 1}
		<div class="w-full h-auto flex-center fixed bottom-0 left-0 z-[100]">
			<Flex
				className="w-full md:max-w-[678px] h-auto pb-5 bg-dark-103/30 px-10 backdrop-blur-md gap-5"
			>
				<!-- next  -->
				{#if steps > 2}
					<Button
						className="w-full h-[45px] mt-10 rounded-full bg-transparent border-[2px] border-red-302 hover:bg-red-303 text-white-100 font-montserrat font-semibold text-sm enableBounceEffect"
						on:click={() => {
							steps -= 1;
						}}
					>
						Prev
					</Button>
				{/if}
				<!-- <Button
				className="w-full h-[45px] mt-10 rounded-full bg-transparent border-[2px] border-red-302 hover:bg-red-303 text-white-100 font-montserrat font-semibold text-sm enableBounceEffect"
				on:click={() => {
					steps += 1;
				}}
			>
				Skip
			</Button> -->

				<!-- prev -->
				{#if steps === 2}
					<Button
						className="w-full h-[45px] mt-10 rounded-full bg-red-305 hover:bg-orange-303 text-white-100 font-montserrat font-semibold text-sm enableBounceEffect"
						on:click={() => {
							$savePreferenceMut.mutate({
								teams: selectedTeams
							});
						}}
					>
						Save
					</Button>
				{/if}
			</Flex>
		</div>
	{/if}
{/if}
