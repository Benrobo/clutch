<script lang="ts">
  import type { ClassValue } from "tailwind-variants";
  import Flex from "./Flex.svelte";
  import Spinner from "./Spinner.svelte";
  import { cn } from "@/utils";

  export let className: ClassValue | undefined = "";
  export let direction: "col" | "row" = "col"; // Added direction prop
  export let label: string | undefined = ""; // Added label prop
</script>

<Flex
  className={cn(
    "w-full h-full flex-" + direction + " items-center justify-center", // Updated to use direction
    className
  )}
>
  <Spinner className="stroke-white-100" />
  {#if label}
    <span class="text-white-300 text-sm mt-2 animate-pulse">{label}</span>
    <!-- Display label below the spinner -->
  {/if}
</Flex>
