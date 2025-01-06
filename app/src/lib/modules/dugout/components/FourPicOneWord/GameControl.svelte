<script lang="ts">
	import Flex from '@/components/Flex.svelte';
	import { cn, shuffleArray } from '@/utils';
	import ThreeDButton from '../ThreeDButton.svelte';
	import SuccessPopup from './SuccessPopup.svelte';
	import { afterUpdate } from 'svelte';

	export let secretWord: string = '';

	const formattedSecretWord = secretWord.toUpperCase();

	const getRandomLettersLength = () => {
		if (formattedSecretWord.length <= 10) return 6;
		if (formattedSecretWord.length <= 15) return 8;
		if (formattedSecretWord.length <= 20) return 10;
		return 12;
	};

	const splitted = formattedSecretWord.split(' ');
	const secretWordLetters = formattedSecretWord.split('');
	const totalLetters = splitted.reduce((acc, curr) => acc + curr.length, 0);
	const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	// random letters & make sure they are not in the secret word
	const randomLetters = shuffleArray(alphabet.split('').slice(0, getRandomLettersLength()));
	const shuffledLetters = shuffleArray(
		[...splitted, ...randomLetters]
			.filter((l) => l.length > 0)
			.join('')
			.split('')
	).map((letter, index) => ({ id: index, letter })); // Add unique id to each letter

	let selectedLetters: { id: number; letter: string | null }[] = new Array(
		formattedSecretWord.length
	)
		.fill(null)
		.map((_, index) => ({ id: index, letter: null })); // Initialize with empty tiles
	$: selectedLetters = new Array(formattedSecretWord.length)
		.fill(null)
		.map((_, index) => ({ id: index, letter: null }));
	$: challengeCompleted = false;

	const onWordSelect = (letterObj: { id: number; letter: string }) => {
		// Find the first available slot with letter: null
		const nullIndex = selectedLetters.findIndex((item) => item.letter === null);

		if (nullIndex !== -1) {
			// Reuse the slot with letter: null
			selectedLetters[nullIndex] = {
				...selectedLetters[nullIndex],
				letter: letterObj.letter,
				id: letterObj.id
			};
		}

		selectedLetters = [...selectedLetters]; // Trigger reactivity
	};

	const removeLetter = (index: number) => {
		selectedLetters[index].letter = null;
		selectedLetters = [...selectedLetters];
	};

	afterUpdate(() => {
		console.log({ selectedLetters, shuffledLetters });
	});
</script>

<div class="w-full h-full flex flex-col items-center justify-between">
	<!-- display letters area -->
	<Flex className="w-full h-auto gap-2 px-10 mt-10 flex-wrap flex-center relative">
		{#each selectedLetters as letterObj, i}
			<button
				class={cn(
					totalLetters <= 10 && 'w-[35px] h-[35px]',
					totalLetters <= 15 && 'w-[45px] h-[45px]',
					letterObj.letter
						? 'bg-gradient-to-b from-[#5C7DDF] to-[#565FCA] outline-none border-t-[5px] border-t-[#95D5FE]/80 text-white'
						: 'bg-[#1c1a31] border-[2px] border-[#5D5081] rounded-sm overflow-hidden'
				)}
				on:click={() => removeLetter(i)}
			>
				<span
					class={cn(
						'text-white font-bruceforever',
						totalLetters <= 10 && 'text-sm',
						totalLetters <= 15 && 'text-lg',
						totalLetters <= 20 && 'text-xl'
					)}
				>
					{#if letterObj.letter}
						{letterObj.letter}
					{/if}
				</span>
			</button>
		{/each}
	</Flex>

	<!-- keyboard -->
	<div
		class="w-full h-auto min-h-[250px] flex flex-col items-center justify-start bg-[#23203c] relative"
	>
		<!-- hints container -->
		<Flex className="w-full h-auto flex-center absolute top-0 left-0 -translate-y-[5em]">
			<div
				class="w-auto max-w-[200px] px-4 min-h-[50px] py-3 bg-[#242240] border-t-[4px] border-t-[#5D5081]"
			>
				<button class="w-[40px] h-[40px] rounded-full flex-center relative enableBounceEffect">
					<img src="/light-bulb.svg" alt="graph" class="w-[45px] h-[45px]" />
					<div
						class="text-white text-nowrap text-lg scale-[.80] font-bold absolute right-0 -bottom-1 translate-x-[2.5em] gap-2 px-[8px] py-[1px] rounded-full text-[#19172a] bg-[#C9C6F0] border-t-[2px] border-t-[#EFEFF1]"
					>
						⭐️ 25
					</div>
				</button>
			</div>
		</Flex>

		<Flex className="w-full h-auto gap-2 px-2 mt-5 flex-wrap items-center justify-center">
			{#each shuffledLetters as letterObj}
				<button
					class={cn(
						'w-[60px] h-[60px] overflow-hidden enableBounceEffect font-bruceforever drop-shadow-md',
						secretWordLetters.includes(letterObj.letter) &&
							selectedLetters.some((selected) => selected.letter === letterObj.letter)
							? 'bg-[#394781] text-[#262655] border-none outline-none' // Disabled state
							: 'bg-gradient-to-b from-[#5C7DDF] to-[#565FCA] outline-none border-t-[5px] border-t-[#95D5FE]/80 text-white' // Enabled state
					)}
					on:click={() => onWordSelect(letterObj)}
					disabled={secretWordLetters.includes(letterObj.letter) &&
						selectedLetters.some((selected) => selected.letter === letterObj.letter)}
				>
					<span class="text-white text-2xl font-bold">{letterObj.letter}</span>
				</button>
			{/each}
		</Flex>
	</div>
</div>

{#if challengeCompleted}
	<SuccessPopup score={25} level="LEVEL 1" />
{/if}
