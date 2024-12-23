<script lang="ts">
  import { cn } from "$lib/utils";
  import type { ClassValue } from "tailwind-variants";

  export let className: ClassValue = "";
</script>

<div class={cn("w-full h-[1px] bg-white-100/10", className)} />
