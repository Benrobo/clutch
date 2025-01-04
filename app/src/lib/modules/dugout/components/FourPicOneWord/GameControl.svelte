<script lang="ts">
	import Flex from '@/components/Flex.svelte';
	import { cn, shuffleArray } from '@/utils';

	export let secretWord: string = '';

	const splitted = secretWord.toUpperCase().split(' ');
	const totalLetters = splitted.reduce((acc, curr) => acc + curr.length, 0);
	const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	const randomLetters = shuffleArray(alphabet.split('').slice(0, 6));
	const shuffledLetters = shuffleArray(
		[...splitted]
			.filter((l) => l.length > 0)
			.join('')
			.split('')
	);
</script>

<div class="w-full h-full flex flex-col items-center justify-between">
	<Flex className="w-full h-auto gap-2 px-10 mt-10 flex-wrap flex-center">
		{#each splitted as letter}
			{#each Array.from({ length: letter.length }) as _, i}
				<button
					class={cn(
						'bg-[#1c1a31] border-[#5D5081] rounded-sm overflow-hidden',
						totalLetters <= 10 && 'w-[35px] h-[35px]',
						totalLetters <= 15 && 'w-[45px] h-[45px]',
						// letter.length > 15 && 'w-[60px] h-[60px]',
						// letter.length > 20 && 'w-[75px] h-[75px]',
						// selected state
						'bg-gradient-to-b from-[#5C7DDF] to-[#565FCA] outline-none border-t-[5px] border-t-[#95D5FE]/80 text-white'
					)}
				>
					<span
						class={cn(
							'text-white font-bruceforever',
							totalLetters <= 10 && 'text-sm',
							totalLetters <= 15 && 'text-lg',
							totalLetters <= 20 && 'text-xl'
						)}
					>
						{letter[i]}
					</span>
				</button>
			{/each}
			<!-- {#if letter !== splitted[splitted.length - 1]}
				<span class="text-white text-2xl font-medium"> - </span>
			{/if} -->
		{/each}
	</Flex>

	<!-- keyboard -->
	<div class="w-full h-auto min-h-[250px] flex flex-col items-center justify-center bg-[#23203c]">
		<Flex className="w-full h-auto gap-2 px-2 mt-5 flex-wrap items-center justify-center">
			{#each shuffledLetters as letter}
				<button
					class={cn(
						'w-[60px] h-[60px] overflow-hidden enableBounceEffect font-bruceforever drop-shadow-md',
						// selected state
						// 'bg-[#394781] text-[#262655] border-none outline-none'

						// unselected state
						'bg-gradient-to-b from-[#5C7DDF] to-[#565FCA] outline-none border-t-[5px] border-t-[#95D5FE]/80 text-white'
					)}
				>
					<span class="text-white text-2xl font-bold">{letter}</span>
				</button>
			{/each}
		</Flex>
	</div>
</div>
