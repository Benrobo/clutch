<script lang="ts">
  import { cn } from "@/utils";
  import { marked } from "marked";
  import type { ClassValue } from "tailwind-variants";

  export let content: string = "";
  export let contentClass: ClassValue = "";

  $: parsedContent = marked.parse(content?.replace(/\\n/g, "\n") || "", {
    breaks: true,
    gfm: true,
  });
</script>

<div
  class={cn(
    "markdown-content [&>h2]:first:font-recoleta font-inter [&>h2]:first:text-extrabold [&>h3]:my-2 [&>h2]:text-orange-100 [&>h2]:text-[1.5em] [&>h2]:font-bold [&>h3]:text-[1.1em] [&>h3]:font-recoleta [&>h3]:font-medium [&>p]:text-white-100/80 font-sans [&>ul]:pl-3 [&>ul]:flex-col [&>ul]:flex [&>ul]:pb-9 [&>ul]:space-y-3 [&>ul]:list-disc [&>ul]:text-[15px] [&>ul>li]:text-white-100/70 [&>ul>li>strong]:text-sm [&>ul>li>strong]:text-white-100 [&>ul>li>strong]:font-medium [&>h2]:last:text-sm [&>p]:last:font-inter [&>p]:first:text-md  [&>h2]:last:mt-5",
    contentClass
  )}
>
  {@html parsedContent}
</div>

<style lang="postcss">
</style>
