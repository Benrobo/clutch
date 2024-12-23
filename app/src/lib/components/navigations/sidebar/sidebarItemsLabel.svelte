<script lang="ts">
  import Flex from "$lib/components/Flex.svelte";
  import { cn } from "$lib/utils";
  import type { ClassValue } from "tailwind-variants";

  export let text: string;
  export let className: ClassValue = "";
</script>

<Flex className={cn("text-white-300/30 font-normal text-xs", className)}>
  <h1>{text}</h1>
</Flex>
