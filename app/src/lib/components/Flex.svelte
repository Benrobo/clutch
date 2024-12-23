<script lang="ts">
  import { cn } from "$lib/utils";
  import type { ClassValue } from "tailwind-variants";
  export let className: ClassValue = "";
</script>

<div
  class={cn("flex flex-row gap-2 items-start justify-start", className)}
  {...$$restProps}
>
  <slot />
</div>
