<script lang="ts">
  import Flex from "$lib/components/Flex.svelte";
  import type {
    ResearchTools,
    GeneralItems,
    SidebarItems,
    ToolSectionProps,
  } from "$lib/types/tool.types";
  import RenderSidebarIcon from "./renderSidebarIcon.svelte";
  import { page } from "$app/stores";
  import { cn, lowerCase } from "$lib/utils";
  import { goto } from "$app/navigation";
  import { afterUpdate, onMount } from "svelte";
  import { derived } from "svelte/store";

  // Get current route once $page changes.
  $: pathname = derived(page, ($page) => $page.url.pathname);
  $: isResearchPage = $pathname.split("/")[2] === "research";
  $: pathName = isResearchPage
    ? derived(page, ($page) =>
        $page.url.pathname.split("/").length >= 4
          ? $page.url.pathname.split("/")[4]
          : $page.url.pathname.split("/")[2]
      ) // research page route
    : derived(page, ($page) => $page.url.pathname.split("/")[2]); // main page route
  $: activeRoute = lowerCase($pathName) as GeneralItems | ResearchTools;

  type Props = {
    name: SidebarItems;
    href: string;
    text: string;
    isNew?: boolean | undefined;
    toolSection?: ToolSectionProps["key"] | null | undefined;
    isAvailable?: boolean | undefined;
    disabled?: boolean | undefined;
  };

  export let name: Props["name"] = "dashboard";
  export let href: Props["href"] = "/app/dashboard";
  export let text: Props["text"] = "Dashboard";
  export let isNew: Props["isNew"];
  export let toolSection: Props["toolSection"] = null;
  export let isAvailable: Props["isAvailable"] = true;
  export let disabled: Props["disabled"] = false;

  $: isActive = activeRoute === name || toolSection === activeRoute;
  $: url = href.startsWith("/") ? `/app${href}` : `/app/${href}`;

  afterUpdate(() => {});
</script>

<a
  href={url}
  class={cn(
    "w-full m-0 px-2 py-2 group hover:bg-dark-102 rounded-sm relative enableMiniBounceEffect",
    isActive ? "opacity-100 text-white-100" : "opacity-80 text-white-100/70",
    isAvailable === false && "opacity-50 cursor-not-allowed",
    disabled && "opacity-50 cursor-not-allowed"
  )}
>
  <Flex className="w-full h-auto items-center gap-1">
    <span
      class={cn(
        "group-hover:opacity-100 opacity-50",
        isActive ? "opacity-100" : "opacity-80"
      )}
    >
      <RenderSidebarIcon key={name} {activeRoute} />
    </span>
    <h1
      class={cn(
        "font-normal text-xs group-hover:text-white-100 relative text-nowrap"
      )}
    >
      {text}
    </h1>
    {#if isNew}
      <span
        class="absolute top-0 -translate-y-[3px] right-0 text-[10px] text-white-100 bg-red-305 rounded-full px-2 py-[2px] scale-[.85]"
      >
        New
      </span>
    {/if}
  </Flex>
</a>
