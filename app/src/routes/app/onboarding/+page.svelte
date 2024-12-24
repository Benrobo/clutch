<script lang="ts">
	import Flex from '@/components/Flex.svelte';
	import Button from '@/components/ui/button.svelte';
	import MainScreen from '@/modules/onboarding/components/MainScreen.svelte';
	import SelectTeams from '@/modules/onboarding/components/SelectTeams.svelte';

	$: steps = 1;

	let selectedTeams: number[] = [];
	$: selectedTeams = [];
</script>

<!-- <MainScreen
	nextStep={() => {
		steps += 1;
	}}
/> -->

<SelectTeams
	onTeamSelect={(team) => {
		selectedTeams = team;
	}}
/>

<!-- control buttons -->
<Flex
	className="w-full h-auto pb-10 bg-dark-103 fixed bottom-0 left-0 px-10 backdrop-blur-sm gap-10"
>
	<!-- next  -->
	{#if steps > 1}
		<Button
			className="w-full h-[45px] mt-10 rounded-full bg-transparent border-[2px] border-red-302 hover:bg-red-303 text-white-100 font-montserrat font-semibold text-sm enableBounceEffect"
			on:click={() => {
				steps -= 1;
			}}
		>
			Prev
		</Button>
	{:else}
		<Button
			className="w-full h-[45px] mt-10 rounded-full bg-red-305 hover:bg-orange-303 text-white-100 font-montserrat font-semibold text-sm enableBounceEffect"
			on:click={() => {
				steps += 1;
			}}
		>
			Next Step
		</Button>
	{/if}

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
