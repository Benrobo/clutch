<script lang="ts">
	import Flex from '@/components/Flex.svelte';
	import Button from '@/components/ui/button.svelte';
	import MainScreen from '@/modules/onboarding/components/MainScreen.svelte';
	import SelectTeams from '@/modules/onboarding/components/SelectTeams.svelte';

	$: steps = 1;

	let selectedTeams: number[] = [];
	$: selectedTeams = [];
</script>

{#if steps === 1}
	<MainScreen
		nextStep={() => {
			steps += 1;
		}}
	/>
{/if}

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
			className="w-full md:max-w-[600px] h-auto pb-5 bg-dark-103/30 px-10 backdrop-blur-md gap-5"
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
						steps += 1;
					}}
				>
					Continue
				</Button>
			{/if}
		</Flex>
	</div>
{/if}
