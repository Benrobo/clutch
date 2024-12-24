<script lang="ts">
	import Logo from '@/components/branding/Logo.svelte';
	import LogoWithText from '@/components/branding/LogoWithText.svelte';
	import Flex from '@/components/Flex.svelte';
	import Button from '@/components/ui/button.svelte';
	import { cn } from '@/utils';
	import { Bot, CheckCheck, HandHeart, Tv } from 'lucide-svelte';
	import { onMount } from 'svelte';

	const sampleTeams = [
		{
			id: 108,
			name: 'Angels',
			abbreviation: 'LAA',
			league: {
				id: 103,
				link: '/api/v1/league/103',
				name: 'American League'
			},
			logo_url: 'https://www.mlbstatic.com/team-logos/108.svg'
		},
		{
			id: 117,
			name: 'Astros',
			abbreviation: 'HOU',
			league: {
				id: 103,
				link: '/api/v1/league/103',
				name: 'American League'
			},
			logo_url: 'https://www.mlbstatic.com/team-logos/117.svg'
		},
		{
			id: 133,
			name: 'Athletics',
			abbreviation: 'OAK',
			league: {
				id: 103,
				link: '/api/v1/league/103',
				name: 'American League'
			},
			logo_url: 'https://www.mlbstatic.com/team-logos/133.svg'
		},
		{
			id: 141,
			name: 'Blue Jays',
			abbreviation: 'TOR',
			league: {
				id: 103,
				link: '/api/v1/league/103',
				name: 'American League'
			},
			logo_url: 'https://www.mlbstatic.com/team-logos/141.svg'
		},
		{
			id: 144,
			name: 'Braves',
			abbreviation: 'ATL',
			league: {
				id: 104,
				link: '/api/v1/league/104',
				name: 'National League'
			},
			logo_url: 'https://www.mlbstatic.com/team-logos/144.svg'
		},
		{
			id: 158,
			name: 'Brewers',
			abbreviation: 'MIL',
			league: {
				id: 104,
				link: '/api/v1/league/104',
				name: 'National League'
			},
			logo_url: 'https://www.mlbstatic.com/team-logos/158.svg'
		},
		{
			id: 138,
			name: 'Cardinals',
			abbreviation: 'STL',
			league: {
				id: 104,
				link: '/api/v1/league/104'
			},
			logo_url: 'https://www.mlbstatic.com/team-logos/138.svg'
		},
		{
			id: 112,
			name: 'Cubs',
			abbreviation: 'CHC',
			league: {
				id: 104,
				link: '/api/v1/league/104'
			},
			logo_url: 'https://www.mlbstatic.com/team-logos/112.svg'
		},
		{
			id: 109,
			name: 'D-backs',
			abbreviation: 'AZ',
			league: {
				id: 104,
				link: '/api/v1/league/104',
				name: 'National League'
			},
			logo_url: 'https://www.mlbstatic.com/team-logos/109.svg'
		},
		{
			id: 119,
			name: 'Dodgers',
			abbreviation: 'LAD',
			league: {
				id: 104,
				link: '/api/v1/league/104'
			},
			logo_url: 'https://www.mlbstatic.com/team-logos/119.svg'
		},
		{
			id: 137,
			name: 'Giants',
			abbreviation: 'SF',
			league: {
				id: 104,
				link: '/api/v1/league/104',
				name: 'National League'
			},
			logo_url: 'https://www.mlbstatic.com/team-logos/137.svg'
		},
		{
			id: 114,
			name: 'Guardians',
			abbreviation: 'CLE',
			league: {
				id: 103,
				link: '/api/v1/league/103',
				name: 'American League'
			},
			logo_url: 'https://www.mlbstatic.com/team-logos/114.svg'
		},
		{
			id: 136,
			name: 'Mariners',
			abbreviation: 'SEA',
			league: {
				id: 103,
				link: '/api/v1/league/103',
				name: 'American League'
			},
			logo_url: 'https://www.mlbstatic.com/team-logos/136.svg'
		},
		{
			id: 146,
			name: 'Marlins',
			abbreviation: 'MIA',
			league: {
				id: 104,
				link: '/api/v1/league/104',
				name: 'National League'
			},
			logo_url: 'https://www.mlbstatic.com/team-logos/146.svg'
		},
		{
			id: 121,
			name: 'Mets',
			abbreviation: 'NYM',
			league: {
				id: 104,
				link: '/api/v1/league/104',
				name: 'National League'
			},
			logo_url: 'https://www.mlbstatic.com/team-logos/121.svg'
		},
		{
			id: 120,
			name: 'Nationals',
			abbreviation: 'WSH',
			league: {
				id: 104,
				link: '/api/v1/league/104',
				name: 'National League'
			},
			logo_url: 'https://www.mlbstatic.com/team-logos/120.svg'
		},
		{
			id: 110,
			name: 'Orioles',
			abbreviation: 'BAL',
			league: {
				id: 103,
				link: '/api/v1/league/103',
				name: 'American League'
			},
			logo_url: 'https://www.mlbstatic.com/team-logos/110.svg'
		},
		{
			id: 135,
			name: 'Padres',
			abbreviation: 'SD',
			league: {
				id: 104,
				link: '/api/v1/league/104',
				name: 'National League'
			},
			logo_url: 'https://www.mlbstatic.com/team-logos/135.svg'
		},
		{
			id: 143,
			name: 'Phillies',
			abbreviation: 'PHI',
			league: {
				id: 104,
				link: '/api/v1/league/104',
				name: 'National League'
			},
			logo_url: 'https://www.mlbstatic.com/team-logos/143.svg'
		},
		{
			id: 134,
			name: 'Pirates',
			abbreviation: 'PIT',
			league: {
				id: 104,
				link: '/api/v1/league/104',
				name: 'National League'
			},
			logo_url: 'https://www.mlbstatic.com/team-logos/134.svg'
		},
		{
			id: 140,
			name: 'Rangers',
			abbreviation: 'TEX',
			league: {
				id: 103,
				link: '/api/v1/league/103'
			},
			logo_url: 'https://www.mlbstatic.com/team-logos/140.svg'
		},
		{
			id: 139,
			name: 'Rays',
			abbreviation: 'TB',
			league: {
				id: 103,
				link: '/api/v1/league/103',
				name: 'American League'
			},
			logo_url: 'https://www.mlbstatic.com/team-logos/139.svg'
		},
		{
			id: 111,
			name: 'Red Sox',
			abbreviation: 'BOS',
			league: {
				id: 103,
				link: '/api/v1/league/103',
				name: 'American League'
			},
			logo_url: 'https://www.mlbstatic.com/team-logos/111.svg'
		},
		{
			id: 113,
			name: 'Reds',
			abbreviation: 'CIN',
			league: {
				id: 104,
				link: '/api/v1/league/104',
				name: 'National League'
			},
			logo_url: 'https://www.mlbstatic.com/team-logos/113.svg'
		},
		{
			id: 115,
			name: 'Rockies',
			abbreviation: 'COL',
			league: {
				id: 104,
				link: '/api/v1/league/104',
				name: 'National League'
			},
			logo_url: 'https://www.mlbstatic.com/team-logos/115.svg'
		},
		{
			id: 118,
			name: 'Royals',
			abbreviation: 'KC',
			league: {
				id: 103,
				link: '/api/v1/league/103',
				name: 'American League'
			},
			logo_url: 'https://www.mlbstatic.com/team-logos/118.svg'
		},
		{
			id: 116,
			name: 'Tigers',
			abbreviation: 'DET',
			league: {
				id: 103,
				link: '/api/v1/league/103',
				name: 'American League'
			},
			logo_url: 'https://www.mlbstatic.com/team-logos/116.svg'
		},
		{
			id: 142,
			name: 'Twins',
			abbreviation: 'MIN',
			league: {
				id: 103,
				link: '/api/v1/league/103',
				name: 'American League'
			},
			logo_url: 'https://www.mlbstatic.com/team-logos/142.svg'
		},
		{
			id: 145,
			name: 'White Sox',
			abbreviation: 'CWS',
			league: {
				id: 103,
				link: '/api/v1/league/103',
				name: 'American League'
			},
			logo_url: 'https://www.mlbstatic.com/team-logos/145.svg'
		},
		{
			id: 147,
			name: 'Yankees',
			abbreviation: 'NYY',
			league: {
				id: 103,
				link: '/api/v1/league/103',
				name: 'American League'
			},
			logo_url: 'https://www.mlbstatic.com/team-logos/147.svg'
		}
	];

	$: selectedTeams = new Set();

	const MAX_TEAM_SELECTION = 5;

	$: selectedCount = selectedTeams.size;

	const getTeamLogoWithBg = (teamId: number) => {
		return `https://midfield.mlbstatic.com/v1/team/${teamId}/spots/500`;
	};

	function toggleTeamSelection(team: any) {
		const teamExist = selectedTeams.has(team.id);
		if (teamExist) {
			selectedTeams.delete(team.id);
		} else if (selectedTeams.size < MAX_TEAM_SELECTION) {
			selectedTeams.add(team.id);
		}
		selectedTeams = selectedTeams;
		onTeamSelect(Array.from(selectedTeams?.values()));
	}

	onMount(() => {});

	export let onTeamSelect = (team: any) => {};
</script>

<Flex className="w-full h-screen flex-col items-start justify-start gap-0">
	<Flex className="w-full h-auto absolute top-0 left-0 z-[1]">
		<div class="w-full h-[450px] rounded-full bg-dark-106/90 blur-[200px]" />
	</Flex>

	<div class="w-full h-auto flex-center z-[10] py-10 flex-col text-center">
		<LogoWithText
			size={30}
			iconClassName="stroke-red-302 text-transparent"
			textClassName="text-red-302 font-montserrat font-bold text-1xl z-[10]"
			strokeWidth={1.5}
			text="Clutch"
		/>
		<p class="text-white-200 font-brunoace font-normal text-md mt-4">Select your favorite teams</p>
	</div>

	<div class="w-full h-full max-h-[100vh] overflow-y-auto px-3 md:px-10">
		<div class="w-full grid grid-cols-4 gap-3 pb-[8em]">
			{#each sampleTeams as team}
				<button
					on:click={() => {
						toggleTeamSelection(team);
					}}
					class={cn(
						'w-[85px] relative rounded-full transition-all z-[10] border-[4px] border-transparent grayscale opacity-50',
						selectedTeams.has(team.id) && 'border-white-100 grayscale-0 opacity-100',
						selectedCount === MAX_TEAM_SELECTION &&
							!selectedTeams.has(team.id) &&
							'grayscale opacity-20'
					)}
				>
					{#if selectedTeams.has(team.id)}
						<span class="bg-white-100 rounded-full absolute -bottom-1 right-1 p-1 scale-[.90]">
							<CheckCheck size={15} class="stroke-dark-100" />
						</span>
					{/if}

					<img src={getTeamLogoWithBg(team.id)} alt={team.name} class="w-full object-contain" />
				</button>
			{/each}
		</div>
	</div>
</Flex>
