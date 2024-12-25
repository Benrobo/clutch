<script lang="ts">
	import { Sparkles } from 'lucide-svelte';

	export let onClick = () => {};
</script>

<button
	type="button"
	class="ai-button-trigger w-auto h-[45px] px-6 relative inline-flex items-center justify-center cursor-pointer overflow-hidden rounded-[100px] border-none outline-none transition-all ease-in-out duration-300 enableBounceEffect"
	on:click={onClick}
>
	<div class="points_wrapper absolute inset-0 z-[1] pointer-events-none overflow-hidden">
		<i class="point" />
		<i class="point" />
		<i class="point" />
		<i class="point" />
		<i class="point" />
		<i class="point" />
		<i class="point" />
		<i class="point" />
		<i class="point" />
		<i class="point" />
	</div>

	<span
		class="inner relative z-[2] w-full text-white flex items-center justify-center gap-1.5 text-base font-medium leading-normal"
	>
		<!-- <Sparkles size={18} /> -->
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

		<span class="text-xs font-poppins"> Ask About This Play </span>
	</span>
</button>

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
		animation: icon-animation 2s linear infinite;
	}

	@keyframes icon-animation {
		0% {
			stroke-dasharray: 0;
			fill: transparent;
		}
		45% {
			stroke-dasharray: 68;
			fill: transparent;
		}
		50%,
		65% {
			stroke-dasharray: 68;
			fill: white;
		}
		66%,
		100% {
			stroke-dasharray: 0;
			fill: white;
		}
	}

	.ai-button-trigger .inner {
		transition: color 0.2s ease-in-out;
	}

	.ai-button-trigger:focus svg.icon {
		fill: white;
	}

	.ai-button-trigger:hover svg.icon {
		fill: transparent;
		animation:
			dasharray 1s linear forwards,
			filled 0.1s linear forwards 0.95s infinite;
	}

	@keyframes dasharray {
		from {
			stroke-dasharray: 0 0 0 0;
		}
		to {
			stroke-dasharray: 68 68 0 0;
		}
	}

	@keyframes filled {
		to {
			fill: white;
		}
	}

	.point {
		bottom: -10px;
		position: absolute;
		animation: floating-points infinite ease-in-out;
		pointer-events: none;
		width: 2px;
		height: 2px;
		background-color: #fff;
		border-radius: 9999px;
	}
	@keyframes floating-points {
		0% {
			transform: translateY(0);
		}
		85% {
			opacity: 0;
		}
		100% {
			transform: translateY(-55px);
			opacity: 0;
		}
	}
	.point:nth-child(1) {
		left: 10%;
		opacity: 1;
		animation-duration: 2.35s;
		animation-delay: 0.2s;
	}
	.point:nth-child(2) {
		left: 30%;
		opacity: 0.7;
		animation-duration: 2.5s;
		animation-delay: 0.5s;
	}
	.point:nth-child(3) {
		left: 25%;
		opacity: 0.8;
		animation-duration: 2.2s;
		animation-delay: 0.1s;
	}
	.point:nth-child(4) {
		left: 44%;
		opacity: 0.6;
		animation-duration: 2.05s;
	}
	.point:nth-child(5) {
		left: 50%;
		opacity: 1;
		animation-duration: 1.9s;
	}
	.point:nth-child(6) {
		left: 75%;
		opacity: 0.5;
		animation-duration: 1.5s;
		animation-delay: 1.5s;
	}
	.point:nth-child(7) {
		left: 88%;
		opacity: 0.9;
		animation-duration: 2.2s;
		animation-delay: 0.2s;
	}
	.point:nth-child(8) {
		left: 58%;
		opacity: 0.8;
		animation-duration: 2.25s;
		animation-delay: 0.2s;
	}
	.point:nth-child(9) {
		left: 98%;
		opacity: 0.6;
		animation-duration: 2.6s;
		animation-delay: 0.1s;
	}
	.point:nth-child(10) {
		left: 65%;
		opacity: 1;
		animation-duration: 2.5s;
		animation-delay: 0.2s;
	}
</style>
