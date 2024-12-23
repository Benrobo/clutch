<script lang="ts">
  import Package from "lucide-svelte/icons/package";
  import Flex from "$lib/components/Flex.svelte";
  import { page } from "$app/stores";
  import SidebarItems from "./sidebarItems.svelte";
  import SidebarItemsLabel from "./sidebarItemsLabel.svelte";
  import {
    researchToolsRoutes,
    generalRoutes,
    ToolSections,
  } from "$lib/data/tools";
  import ArrowLeft from "lucide-svelte/icons/arrow-left";
  import Divider from "$lib/components/Divider.svelte";
  import { cn, extractAxiosResponseData, isPagePath } from "$lib/utils";
  import { useGlobalStore } from "@/store/global.store";
  import { createQuery } from "@tanstack/svelte-query";
  import { getProjects } from "@/http/requests";
  import DropdownSidebarItem from "./dropdownSidebarItem.svelte";
  import { afterUpdate, onMount } from "svelte";
  import { derived } from "svelte/store";
  import { PanelRight } from "lucide-svelte";
  import UserProfileMenu from "./userProfileMenu.svelte";
  import useViewport from "@/hooks/useViewport";
  import CreditTopUpModal from "./CreditTopUpModal.svelte";
  import UpgradeAccount from "@/components/UpgradeAccount/index.svelte";
  import ProjectsSelectDd from "./projectsSelectDd.svelte";

  const globalStore = useGlobalStore();

  const { isMobile, windowWidth } = useViewport();

  const MAX_REFETCH_COUNT = 15;
  $: rendered = false;
  $: refetchCount = 0;
  let initialLoad = true;

  $: getProjectsQuery = createQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      refetchCount++;
      return await getProjects();
    },
    staleTime: 5 * 60 * 1000,
    // keep refetching if null was returned as the project name
    refetchInterval: (query) => {
      const responseData = extractAxiosResponseData(
        query.state.data,
        "success"
      )?.data;

      const hasNullable = (responseData as Record<string, any>[])?.some(
        (item: any) => item.name === null
      );

      if (!hasNullable || refetchCount === MAX_REFETCH_COUNT) {
        return false;
      }

      return 5000;
    },
  });

  $: projects = $getProjectsQuery.data?.data ?? [];

  $: if ($getProjectsQuery.isSuccess) {
    const data = $getProjectsQuery.data["data"] as {
      id: string;
      name: string;
    }[];
    projects = data;
    globalStore.setLoading($getProjectsQuery.isLoading);
    globalStore.setProjectIdeas(data);
  }

  $: slug = derived(page, ($page) => $page.url.pathname.split("/")[3]);
  $: pathname = derived(page, ($page) => $page.url.pathname);
  $: isDashboardPage = isPagePath($pathname, "dashboard");
  $: isResearchPage = isPagePath($pathname, "research");
  $: isResearchPageMain = isPagePath($pathname, "research-main");

  $: if (rendered && initialLoad) {
    // Only set initial state on first render
    if ($isMobile) globalStore.toggleSidebar(false);
    else globalStore.toggleSidebar(true);
    initialLoad = false;
  }

  onMount(() => {
    rendered = true;
  });
</script>

<!-- global modal -->
<!-- upgrade account modal -->
<UpgradeAccount />

<CreditTopUpModal />

<div
  class={cn(
    "flex flex-col items-start justify-start h-screen gap-2 p-0 m-0 transition-all ease-in-out duration-300",
    $isMobile
      ? !$globalStore.isSidebarOpen
        ? "w-0 overflow-hidden"
        : "w-[250px]"
      : !$globalStore.isSidebarOpen
        ? "w-0 overflow-hidden"
        : "w-[250px]", // Always show on desktop
    $isMobile &&
      rendered &&
      "fixed top-0 left-0 z-[99999999] bg-dark-106 shadow-2xl drop-shadow-2xl"
  )}
>
  <div class="w-full h-full">
    <!-- branding section -->
    <Flex
      className="w-full h-[60px] flex-row items-center justify-between px-2 py-5 gap-3"
    >
      <a href="/" class="w-auto">
        <Flex className="w-full items-center">
          <span>
            <img src="/scribe-logo.svg" alt="logo" class="w-[25px]" />
          </span>
          <h1 class="text-white-100 font-light font-brunoace text-md">
            ScribeAI
          </h1>
        </Flex>
      </a>

      <button
        class="visible"
        on:click={() => {
          globalStore.toggleSidebar(!$globalStore.isSidebarOpen);
        }}
      >
        <PanelRight size={20} class="stroke-white-300" />
      </button>
    </Flex>

    <Divider />

    <!-- show this on path aside the dashboard, /app/<research, ..etc> except /app/dashboard -->

    {#if !isResearchPageMain}
      <a
        href="/app/research"
        class={cn(isDashboardPage ? "opacity-0" : "opacity-1")}
      >
        <Flex className="w-full h-[60px] px-2 py-5 gap-1">
          <ArrowLeft color="#ccc" size={15} />
          <h1 class="text-white-100/50 font-normal text-xs underline">Back</h1>
        </Flex>
      </a>
    {/if}

    <!-- this shouldn't be shown on /research/* page -->
    <div class="w-full px-2 flex flex-col gap-2 mt-5">
      {#if !isResearchPage}
        <SidebarItemsLabel text="Tools" className="ml-2" />
        {#each ToolSections.filter((t) => t.isAvailable) as tool (tool.name)}
          <SidebarItems
            text={tool.label}
            name={tool.name}
            href={tool.path}
            isNew={tool.isNew}
            toolSection={tool.key}
            isAvailable={tool.isAvailable}
            disabled={$globalStore.isLoading}
          />
        {/each}

        <!-- Free Tools -->
        <SidebarItemsLabel text="Free Tools" className="ml-2 mt-2" />
        <SidebarItemsLabel
          text="Coming Soon"
          className="ml-2 text-white-100/70 text-xs"
        />
      {/if}
    </div>

    <!-- show this nav items if user isn't on /app/research -->
    <!-- RESEARCH TOOLS SECTION -->

    <div class="w-full px-2 flex flex-col gap-1">
      {#if isResearchPage}
        <SidebarItemsLabel text="Research Tools" className="ml-2" />

        {#each researchToolsRoutes.filter((tool) => tool.isAvailable) as tool (tool.name)}
          <SidebarItems
            text={tool.label}
            name={tool.name}
            href={`/research/${$slug}${tool.path}`}
            isNew={tool.isNew}
          />
        {/each}
      {/if}
    </div>

    {#if generalRoutes.filter((r) => r.enabled).length > 0}
      <div class="w-full px-3">
        <SidebarItemsLabel text="General" className="mt-10 ml-2" />
        <Flex className="w-full flex-col gap-6">
          {#each generalRoutes.filter((r) => r.enabled) as route (route.name)}
            <SidebarItems
              text={route.label}
              name={route.name}
              href={route.path}
              isNew={false}
            />
          {/each}
        </Flex>
      </div>
    {/if}

    <div class="w-full px-3 mt-5">
      <Divider />
      <br />
      <DropdownSidebarItem
        list={projects}
        label="Project Ideas"
        isLoading={$getProjectsQuery.isPending}
      />
    </div>
  </div>

  <UserProfileMenu />
</div>
