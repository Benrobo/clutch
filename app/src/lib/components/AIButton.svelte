<script lang="ts">
	import { cn } from '@/utils';
	import { Sparkles } from 'lucide-svelte';
	import Spinner from './Spinner.svelte';

	export let onClick = () => {};
	export let visible: boolean = false;
	export let loading: boolean = false;
	export let label: string = 'Ask About This Play';
</script>

{#if visible}
	<button
		type="button"
		class={cn(
			'ai-button-trigger w-auto h-[45px] px-6 relative inline-flex items-center justify-center cursor-pointer overflow-hidden rounded-[100px] border-none outline-none transition-all ease-in-out duration-500 enableBounceEffect',
			loading && 'grayscale cursor-not-allowed'
		)}
		disabled={loading}
		on:click={onClick}
	>
		<div class="points_wrapper absolute inset-0 z-[1] pointer-events-none overflow-hidden">
			{#each Array(8) as _, i}
				<i class="point" />
			{/each}
		</div>

		<span
			class="inner relative z-[2] w-full text-white flex items-center justify-center gap-1.5 text-base font-medium leading-normal"
		>
			<!-- <Sparkles size={18} /> -->
			{#if loading}
				<Spinner size={'18'} />
			{:else}
				<svg
					class="icon"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2.5"
				>
					<polyline
						points="13.18 1.37 13.18 9.64 21.45 9.64 10.82 22.63 10.82 14.36 2.55 14.36 13.18 1.37"
					></polyline></svg
				>
			{/if}

			<span class="text-xs font-poppins"> {label} </span>
		</span>
	</button>
{/if}

<style>
	/* From Uiverse.io by ilkhoeri */
	.ai-button-trigger {
		background: radial-gradient(
				65.28% 65.28% at 50% 100%,
				rgba(223, 113, 255, 0.8) 0%,
				rgba(223, 113, 255, 0) 100%
			),
			linear-gradient(0deg, #7a5af8, #7a5af8);
	}
	.ai-button-trigger::before,
	.ai-button-trigger::after {
		content: '';
		position: absolute;
		inset: var(--space);
		transition: all 0.5s ease-in-out;
		border-radius: calc(var(--round) - var(--space));
		z-index: 0;
	}
	.ai-button-trigger::before {
		--space: 1px;
		--round: 0.75rem;
		background: linear-gradient(
			177.95deg,
			rgba(255, 255, 255, 0.19) 0%,
			rgba(255, 255, 255, 0) 100%
		);
	}
	.ai-button-trigger::after {
		--space: 2px;
		--round: 0.75rem;
		background: radial-gradient(
				65.28% 65.28% at 50% 100%,
				rgba(223, 113, 255, 0.8) 0%,
				rgba(223, 113, 255, 0) 100%
			),
			linear-gradient(0deg, #7a5af8, #7a5af8);
	}

	.ai-button-trigger .inner svg.icon {
		width: 18px;
		height: 18px;
		fill: transparent;
		animation: dasharray 2s linear forwards infinite;
	}

	.ai-button-trigger .inner {
		transition: color 0.2s ease-in-out;
	}

	.ai-button-trigger:focus svg.icon {
		/* fill: white; */
	}

	.ai-button-trigger:hover svg.icon {
		fill: transparent;
		animation:
			dasharray 1s linear forwards,
			filled 0.1s linear forwards 0.95s;
	}

	/* @keyframes dasharray {
		from {
			stroke-dasharray: 0 0 0 0;
		}
		to {
			stroke-dasharray: 68 68 0 0;
		}
	} */

	@keyframes filled {
		to {
			fill: white;
		}
	}

	.point {
		bottom: -10px;
		position: absolute;
		pointer-events: none;
		width: 2px;
		height: 2px;
		background-color: #fff;
		border-radius: 9999px;
	}

	.point:nth-child(1) {
		left: 10%;
		opacity: 1;
		transform: translateY(-35px);
	}
	.point:nth-child(2) {
		left: 30%;
		opacity: 0.7;
		transform: translateY(-20px);
	}
	.point:nth-child(3) {
		left: 25%;
		opacity: 0.8;
		transform: translateY(-35px);
	}
	.point:nth-child(4) {
		left: 44%;
		opacity: 0.6;
		transform: translateY(-20px);
	}
	.point:nth-child(5) {
		left: 50%;
		opacity: 1;
		transform: translateY(-35px);
	}
	.point:nth-child(6) {
		left: 75%;
		opacity: 0.5;
		transform: translateY(-20px);
	}
	.point:nth-child(7) {
		left: 88%;
		opacity: 0.9;
		transform: translateY(-35px);
	}
	.point:nth-child(8) {
		left: 58%;
		opacity: 0.8;
		transform: translateY(-20px);
	}
	.point:nth-child(9) {
		left: 98%;
		opacity: 0.6;
		transform: translateY(-35px);
	}
	.point:nth-child(10) {
		left: 65%;
		opacity: 1;
		transform: translateY(-20px);
	}
</style>
