<script lang="ts">
  import type { HTMLTableAttributes } from "svelte/elements";
  import { cn } from "$lib/utils";

  type $$Props = HTMLTableAttributes;

  let className: $$Props["class"] = undefined;
  export { className as class };
</script>

<!-- <div class="relative w-full overflow-auto"> -->
<table
  class={cn(
    "w-full caption-bottom text-sm rounded-md border-[.5px] border-white-400",
    className
  )}
  {...$$restProps}
>
  <slot />
</table>
<!-- </div> -->
