<script lang="ts">
  import * as Popover from "$lib/components/ui/popover";
  import { cn } from "@/utils";
  import type { ClassValue } from "tailwind-variants";

  export let text: string | undefined = undefined;
  export let contentClassName: ClassValue = "";
</script>

<Popover.Root>
  <Popover.Trigger>
    <slot />
  </Popover.Trigger>
  <Popover.Content
    class={cn(
      contentClassName,
      "font-poppins text-sm text-white-100 bg-dark-107 border-[1.5px] border-gray-101/30 shadow-2xl drop-shadow-2xl"
    )}
  >
    {text}
  </Popover.Content>
</Popover.Root>
