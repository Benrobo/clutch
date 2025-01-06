<script lang="ts">
	import Flex from '@/components/Flex.svelte';
	import { cn, shuffleArray } from '@/utils';
	import ThreeDButton from '../ThreeDButton.svelte';
	import SuccessPopup from './SuccessPopup.svelte';
	import { afterUpdate } from 'svelte';
	import { Shuffle } from 'lucide-svelte';
	import { dugoutStore, useDugoutStore } from '@/store/dugout.store';
	import { USER_GAME_LEVELS_MAP_TOTAL_POINTS } from '@/constant/dugout';
	import type { FourPicOneWordChallenge } from '@/types/dugout';

	export let secretWord: string = '';
	export let currentChallenge: FourPicOneWordChallenge | null = null;
	export let gameLevel: string = '';
	export let hintPoints: number = 0;
	export let slug: string = '';

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
	const randomLetters = shuffleArray(alphabet.split('').slice(0, getRandomLettersLength()));
	let shuffledLetters: { id: number; letter: string; sourceIndex: number; isUsed: boolean }[] = [];
	$: shuffledLetters = shuffleArray(
		[...secretWordLetters, ...randomLetters]
			.filter((l) => l.length > 0)
			.join('')
			.split('')
	).map((letter, index) => ({
		id: index,
		letter,
		sourceIndex: index,
		isUsed: false
	}));

	// Initialize selectedLetters with empty tiles
	let selectedLetters: { id: number; letter: string | null; sourceIndex?: number }[] = new Array(
		formattedSecretWord.length
	)
		.fill(null)
		.map((_, index) => ({ id: index, letter: null })); // Initialize with empty tiles

	// Add this reactive statement to track when all slots are filled
	$: isAllSlotsFilled = selectedLetters.every((letter) => letter.letter !== null);
	$: isWrong = isAllSlotsFilled && !isSelectedLettersCorrect();
	$: shouldShake = isWrong;

	$: shuffleAnimation = true;

	const userLevel = $dugoutStore?.userGameLevelSession?.find(
		(session) => session.game_id === slug
	) ?? { level: 'apprentice', game_id: slug };
	$: awardedPoints =
		USER_GAME_LEVELS_MAP_TOTAL_POINTS[
			userLevel?.level as keyof typeof USER_GAME_LEVELS_MAP_TOTAL_POINTS
		];

	const onWordSelect = (letterObj: {
		id: number;
		letter: string;
		sourceIndex: number;
		isUsed: boolean;
	}) => {
		const nullIndex = selectedLetters.findIndex((item) => item.letter === null);

		if (nullIndex !== -1) {
			// Mark this specific letter instance as used
			const letterIndex = shuffledLetters.findIndex((l) => l.sourceIndex === letterObj.sourceIndex);
			if (letterIndex !== -1) {
				shuffledLetters[letterIndex].isUsed = true;
			}

			selectedLetters[nullIndex] = {
				letter: letterObj.letter,
				id: nullIndex,
				sourceIndex: letterObj.sourceIndex
			};
			selectedLetters = [...selectedLetters];
		}
	};

	const shuffleLetters = () => {
		shuffleAnimation = true;
		shuffledLetters = shuffleArray(shuffledLetters);
	};

	const removeLetter = (index: number) => {
		const removedLetter = selectedLetters[index];
		if (removedLetter.sourceIndex !== undefined) {
			// Re-enable the specific letter instance in shuffledLetters
			const letterIndex = shuffledLetters.findIndex(
				(l) => l.sourceIndex === removedLetter.sourceIndex
			);
			if (letterIndex !== -1) {
				shuffledLetters[letterIndex].isUsed = false;
			}
		}
		selectedLetters[index].letter = null;
		selectedLetters = [...selectedLetters];
	};

	const isLetterDisabled = (letterObj: {
		id: number;
		letter: string;
		sourceIndex: number;
		isUsed: boolean;
	}) => {
		return letterObj.isUsed;
	};

	const isSelectedLettersCorrect = () => {
		const _selectedLetters = selectedLetters
			.filter((letter) => letter.letter !== null)
			?.map((letter) => letter.letter)
			?.join('');
		return _selectedLetters === formattedSecretWord;
	};

	$: {
		if (isWrong) {
			setTimeout(() => {
				shouldShake = false;
			}, 1000);
		}

		if (shuffleAnimation) {
			setTimeout(() => {
				shuffleAnimation = false;
			}, 100);
		}
	}

	afterUpdate(() => {
		console.log($dugoutStore);
	});
</script>

<div class="w-full h-full flex flex-col items-center justify-between">
	<!-- display letters area -->
	<Flex className={cn('w-auto h-auto gap-2 mt-10 flex-wrap flex-center relative')}>
		{#each selectedLetters as letterObj, i}
			<button
				class={cn(
					' rounded-sm overflow-hidden',
					totalLetters <= 10 && 'w-[35px] h-[35px]',
					totalLetters <= 15 && 'w-[45px] h-[45px]',
					shouldShake
						? 'animate-shake !bg-red-305/50 text-white border-[3px] border-red-200'
						: letterObj.letter
							? 'bg-gradient-to-b from-[#5C7DDF] to-[#565FCA] outline-none border-t-[5px] border-t-[#95D5FE]/80 text-white'
							: 'bg-[#1c1a31] border-[2px] border-[#5D5081]'
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
		<!-- (hints, shuffle) container -->
		<Flex
			className="w-full h-auto flex-center absolute top-0 left-0 -translate-y-[6em] scale-[.75]"
		>
			<div
				class="w-full max-w-[200px] px-4 min-h-[50px] py-3 bg-[#242240] border-t-[4px] border-t-[#5D5081] flex-center gap-10"
			>
				<button
					class="w-[60px] h-[60px] rounded-full flex flex-col flex-center relative enableBounceEffect"
				>
					<img src="/light-bulb.svg" alt="graph" class="w-[65px] h-[65px]" />
					<div
						class={cn(
							'text-white text-nowrap scale-[.80] font-normal gap-2 px-[8px] py-[1px] rounded-full text-[#19172a] bg-[#C9C6F0] border-t-[2px] border-t-[#EFEFF1]',
							hintPoints > 100 ? 'text-xs' : 'text-lg'
						)}
					>
						⭐️ {hintPoints}
					</div>
				</button>

				<ThreeDButton
					colorType="pink"
					className="w-[60px] h-[60px] rounded-full flex-center relative enableBounceEffect"
					onClick={() => shuffleLetters()}
				>
					<Shuffle size={35} />
				</ThreeDButton>
			</div>
		</Flex>

		<Flex
			className={cn(
				'w-full h-auto gap-2 px-2 mt-5 flex-wrap items-center justify-center transition-all',
				shuffleAnimation ? 'scale-[.10]' : 'scale-[1]'
			)}
		>
			{#each shuffledLetters as letterObj}
				<button
					class={cn(
						'w-[60px] h-[60px] overflow-hidden font-poppins drop-shadow-md',
						isLetterDisabled(letterObj)
							? 'bg-[#394781] text-[#262655] border-none outline-none' // Disabled state
							: 'enableBounceEffect bg-gradient-to-b from-[#5C7DDF] to-[#565FCA] outline-none border-t-[5px] border-t-[#95D5FE]/80 text-white' // Enabled state
					)}
					on:click={() => onWordSelect(letterObj)}
					disabled={isLetterDisabled(letterObj)}
				>
					<span class="text-white text-2xl font-bold">{letterObj.letter}</span>
				</button>
			{/each}
		</Flex>
	</div>
</div>

{#if isAllSlotsFilled && isSelectedLettersCorrect()}
	<SuccessPopup
		score={awardedPoints}
		level={gameLevel}
		secretWord={formattedSecretWord}
		media={currentChallenge?.media}
	/>
{/if}
