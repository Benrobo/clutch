<script lang="ts">
  import { tweened } from "svelte/motion";
  import { cubicOut } from "svelte/easing";

  export let progress: number = 0;
  export let size: number = 100;
  export let strokeWidth: number = 10;
  export let barColor: string = "#3770fe";
  export let backgroundColor: string = "#222222";
  export let centerText: string | null = null;
  export let textColor: string = "#ffffff";
  export let textSize: number = 16;

  $: radius = (size - strokeWidth) / 2;
  $: circumference = radius * 2 * Math.PI;
  $: dashOffset = tweened(circumference, {
    duration: 500,
    easing: cubicOut,
  });

  $: {
    $dashOffset = circumference * (1 - progress / 100);
  }
</script>

<div class="circle-progress-bar" style="width: {size}px; height: {size}px;">
  <svg width={size} height={size}>
    <circle
      class="background"
      r={radius}
      cx={size / 2}
      cy={size / 2}
      fill="transparent"
      stroke={backgroundColor}
      stroke-width={strokeWidth}
    />
    <circle
      class="progress"
      r={radius}
      cx={size / 2}
      cy={size / 2}
      fill="transparent"
      stroke={barColor}
      stroke-width={strokeWidth}
      stroke-dasharray={circumference}
      stroke-dashoffset={$dashOffset}
      stroke-linecap="round"
    />
    {#if centerText !== null}
      <text
        x="50%"
        y="50%"
        text-anchor="middle"
        dominant-baseline="central"
        fill={textColor}
        font-size={textSize}
      >
        {centerText}
      </text>
    {/if}
  </svg>
</div>

<style>
  .circle-progress-bar {
    position: relative;
  }

  circle {
    transition: stroke-dashoffset 0.5s ease;
    transform: rotate(-90deg);
    transform-origin: 50% 50%;
  }
</style>
