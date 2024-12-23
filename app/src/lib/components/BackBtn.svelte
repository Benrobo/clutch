<script lang="ts">
  import ArrowLeft from "lucide-svelte/icons/arrow-left";
  import { cn } from "@/utils";
  import { goto } from "$app/navigation";

  export let label = "Back";
  export let iconClassName = "";
  export let labelClassName = "";
  export let href: string | undefined = undefined;

  function handleClick() {
    if (href) {
      goto(href);
    } else {
      history.back();
    }
  }
</script>

<button
  on:click={handleClick}
  class="flex items-center gap-2 hover:opacity-80 transition-opacity mb-5"
>
  <ArrowLeft class={cn("w-4 h-4", iconClassName)} />
  <span class={cn("text-sm", labelClassName)}>{label}</span>
</button>
