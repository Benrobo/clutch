<script lang="ts">
  import Package from "lucide-svelte/icons/package";
  import Flex from "$lib/components/Flex.svelte";
  import { page } from "$app/stores";
  import { cn } from "$lib/utils";
  import createGlobalStore from "@/store/global.store";
  import { Blocks, Minus, Plus } from "lucide-svelte";
  import { derived } from "svelte/store";
  import { onMount } from "svelte";
  import { boolean } from "zod";
  import Spinner from "@/components/Spinner.svelte";

  const globalStore = createGlobalStore();

  $: pathname = derived(page, ($page) => $page.url.pathname);
  $: slug = $pathname.split("/")[3];
  $: isResearchAnalysisPage = $pathname.split("/").length > 3;
  $: isOpen = true;

  const toggleDropdown = () => {
    isOpen = !isOpen;
  };

  export let list: { id: string; name: string }[] | undefined =
    $globalStore.projectIdeas;
  export let label: string;
  export let isLoading: boolean = false;

  // Sort the list to put active item first
  $: sortedList = list
    ? list.length > 10
      ? [...list].sort((a, b) => {
          if (a.id === slug) return -1;
          if (b.id === slug) return 1;
          return 0;
        })
      : list
    : [];

  async function handleClick(e: MouseEvent, url: string) {
    // e.preventDefault();
    // window.location.href = url; // Force hard reload
  }

  onMount(() => {});
</script>

<Flex className="w-full h-auto flex-col items-start justify-start">
  <button
    class={cn(
      "w-full flex flex-row items-center justify-between m-0 px-2 py-2 hover:bg-dark-102 rounded-sm relative enableMiniBounceEffect",
      // isOpen || isResearchAnalysisPage ? "bg-dark-102 " : "",
      "bg-dark-102",
      slug
        ? "text-white-100 stroke-white-100"
        : "text-white-300 stroke-white-100"
    )}
    on:click={toggleDropdown}
  >
    <Flex className="items-center justify-start">
      <Package class="" size={20} />
      <h1 class="font-normal text-xs">{label}</h1>
    </Flex>

    {#if isOpen}
      <Minus size={16} />
    {:else}
      <Plus size={16} />
    {/if}
  </button>
  <!-- content -->
  <Flex
    className={cn(
      "w-full max-h-[200px] overflow-y-auto hideScrollBar",
      isOpen ? "h-auto" : "h-0"
    )}
  >
    {#if isLoading}
      <Flex className="w-full items-center justify-center py-1">
        <Spinner size={"14"} />
      </Flex>
    {:else}
      <Flex
        className={cn(
          "w-full flex-col gap-4 border-l-[1px] border-white-400 pl-2 ml-4"
        )}
      >
        {#if sortedList && sortedList?.length > 0}
          {#each sortedList as item}
            <a
              href={`/app/research/${item.id}/insight-lens`}
              on:click={(e) =>
                handleClick(e, `/app/research/${item.id}/insight-lens`)}
              class={cn(
                "w-full flex flex-row items-center justify-start gap-2 hover:text-white-100 hover:stroke-white-100 transition-all ",
                item.id === slug
                  ? "text-white-100 stroe-white-100"
                  : "text-white-300 stroke-white-100 opacity-50"
              )}
            >
              <Blocks class="" size={17} />
              <h1 class="font-normal text-xs">{item.name}</h1>
            </a>
          {/each}
        {:else}
          <h1 class="text-white-100 font-normal text-xs">No project ideas</h1>
        {/if}
      </Flex>
    {/if}
  </Flex>
</Flex>
