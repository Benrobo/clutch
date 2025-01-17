<script lang="ts">
	import { cn } from '@/utils';
	import type { MatchupListResponse } from '@/types/matchup';
	import Flex from '@/components/Flex.svelte';
	import Icon from '@/components/Icon.svelte';
	import ErrorAction from '@/components/ErrorAction.svelte';
	import Spinner from '@/components/Spinner.svelte';

	export let matchupList: MatchupListResponse[] = [];
	export let onSelect: (id: MatchupListResponse) => void;
</script>

<div class="w-full h-screen mx-auto flex flex-col items-start justify-start bg-dark-103 px-4">
	<!-- header -->
	<div class="flex flex-col items-center justify-center gap-2">
		<Flex className="w-full flex-row items-center py-1">
			<p class="text-white-200 text-sm font-poppins font-normal">Recent Matchups</p>
		</Flex>
	</div>

	<!-- list -->
	<div
		class="w-full h-full max-h-[calc(100vh-10em)] overflow-y-auto hideScrollBar2 pb-[20em] flex flex-col items-start justify-start gap-5 mt-5"
	>
		{#each matchupList as matchup}
			{#if matchup.error}
				<div
					class="w-full h-auto min-h-[180px] flex flex-row items-start justify-start py-5 gap-1 relative rounded-2xl bg-dark-106 border-[1px] border-white-400/10 overflow-hidden transition-all"
				>
					<ErrorAction
						error={matchup.error}
						isLoading={false}
						callback={() => {}}
						showActionButton={true}
					/>
				</div>
			{:else if matchup.status === 'PENDING' || matchup.status === 'PROCESSING'}
				<div
					class="w-full h-auto min-h-[180px] flex flex-col items-center justify-center py-5 gap-3 relative rounded-2xl bg-dark-106 border-[1px] border-white-400/10 overflow-hidden transition-all"
				>
					<span class="text-sm text-white-200 font-jetbrains font-normal">
						{matchup.status === 'PENDING' ? '⚡ Getting Ready...' : '🔍 Analyzing Players Stats...'}
					</span>
					<Spinner size="25" strokeWidth="2.5" />
				</div>
			{:else if matchup.status === 'FAILED'}
				<div
					class="w-full h-auto min-h-[180px] flex flex-row items-center justify-center py-5 gap-1 relative rounded-2xl bg-dark-106 border-[1px] border-white-400/10 overflow-hidden transition-all"
				>
					<ErrorAction
						error={matchup.error ?? 'Failed to fetch matchup'}
						isLoading={false}
						callback={() => {}}
						showActionButton={true}
					/>
				</div>
			{:else}
				<button
					class={cn(
						'w-full h-auto min-h-[180px] flex flex-row items-start justify-start py-5 gap-1 relative rounded-2xl bg-dark-106 border-[1px] border-white-400/10 overflow-hidden transition-all'
					)}
					on:click={() => onSelect(matchup)}
				>
					<!-- pattern -->
					<div class="w-full max-w-[50em] absolute top-0">
						<img src="/pattern-2.jpg" alt="pattern" class="w-full h-full grayscale opacity-10" />
					</div>

					<!-- matchup info -->
					<div class="w-full h-full grid grid-cols-2 z-[1]">
						<Flex class="w-full h-full flex flex-col gap-2 relative">
							<img
								src={matchup?.player_position_stats.challenger?.info?.profilePicture}
								alt="challenger"
								class="w-[10em] translate-y-4 md:w-[12.5em] md:-translate-y-2 object-cover absolute right-10"
							/>

							<!-- info -->
							<div
								class="w-full h-auto absolute bottom-0 translate-y-5 py-3 px-3 flex flex-col items-start justify-start gap-0 bg-gradient-to-b from-transparent to-dark-103"
							>
								<p class="text-white-100 text-3xl translate-y-2 font-mouzambik font-normal">
									{matchup?.player_position_stats.challenger?.info?.name}
								</p>
							</div>
						</Flex>
						<Flex class="w-full h-full flex flex-col gap-2 items-end justify-end relative">
							<img
								src={matchup?.player_position_stats.opponent?.info?.profilePicture}
								alt="opponent"
								class="w-[10em] translate-y-10 translate-x-4 md:w-[12.5em] object-cover absolute right-0"
							/>

							<!-- info -->
							<div
								class="w-full h-auto absolute bottom-0 translate-y-5 py-3 px-3 flex flex-col items-end justify-end gap-0 bg-gradient-to-b from-transparent to-dark-103"
							>
								<p class="text-white-100 text-3xl translate-y-2 font-mouzambik font-normal">
									{matchup?.player_position_stats.opponent?.info?.name}
								</p>
							</div>
						</Flex>
					</div>

					<!-- lightning bolt divider -->
					<div class="w-full h-full flex flex-col items-center justify-center absolute top-0">
						<Icon name="lighting-bolt" className="fill-dark-103 scale-[1]" size="800px" />
						<div
							class="flex-center absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]"
						>
							<h1 class="text-white-200 text-[4em] font-facon font-normal">vs</h1>
						</div>
					</div>
				</button>
			{/if}
		{/each}
	</div>
</div>
