<script lang="ts">
  import { Popover as PopoverPrimitive } from "bits-ui";
  import { cn, flyAndScale } from "$lib/utils";

  type $$Props = PopoverPrimitive.ContentProps;
  let className: $$Props["class"] = undefined;
  export let transition: $$Props["transition"] = flyAndScale;
  export let transitionConfig: $$Props["transitionConfig"] = undefined;
  export { className as class };
</script>

<PopoverPrimitive.Content
  {transition}
  {transitionConfig}
  class={cn(
    "w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] bg-popover text-popover-foreground z-50 rounded-md border p-4 shadow-md outline-none",
    className
  )}
  {...$$restProps}
>
  <slot />
</PopoverPrimitive.Content>
