<script lang="ts">
  import { type SidebarItems } from "$lib/types/tool.types";
  import { cn } from "$lib/utils";
  import DollarSign from "lucide-svelte/icons/dollar-sign";
  import ChartNoAxesCombined from "lucide-svelte/icons/chart-no-axes-combined";
  import ChartCandlestickEvents from "lucide-svelte/icons/chart-candlestick";
  import Feather from "lucide-svelte/icons/feather";
  import Package from "lucide-svelte/icons/package";
  import Crosshair from "lucide-svelte/icons/crosshair";
  import Wrench from "lucide-svelte/icons/wrench";
  import type { ClassValue } from "tailwind-variants";
  import Radar from "lucide-svelte/icons/radar";
  import SquareUser from "lucide-svelte/icons/square-user";
  import PackagePlus from "lucide-svelte/icons/package-plus";
  import ChartPie from "lucide-svelte/icons/chart-pie";

  type $$Props = {
    key: SidebarItems;
    activeRoute: SidebarItems | null;
  };

  export let key: $$Props["key"];
  export let activeRoute: $$Props["key"] | null = null;

  let defaultClassName: ClassValue = "";
  let defaultColor: string = "#fff";
</script>

<!-- render sidebar icons based on key -->
{#if key === "dashboard"}
  <ChartCandlestickEvents
    color={activeRoute === key ? "#fff" : defaultColor}
    size={20}
  />
{:else if key === "insight-lens"}
  <Package
    className={cn(activeRoute === key ? "stroke-white-100" : defaultClassName)}
    size={20}
    color={activeRoute === key ? "#fff" : defaultColor}
  />
{:else if key === "market-demand-analysis"}
  <ChartNoAxesCombined
    className={cn(activeRoute === key ? "stroke-white-100" : defaultClassName)}
    size={20}
    color={activeRoute === key ? "#fff" : defaultColor}
  />
{:else if key === "pricing-analysis"}
  <DollarSign
    className={cn(activeRoute === key ? "stroke-white-100" : defaultClassName)}
    size={20}
    color={activeRoute === key ? "#fff" : defaultColor}
  />
{:else if key === "feature-comparison"}
  <PackagePlus
    className={cn(activeRoute === key ? "stroke-white-100" : defaultClassName)}
    size={20}
    color={activeRoute === key ? "#fff" : defaultColor}
  />
{:else if key === "swot-analysis"}
  <ChartPie
    className={cn(activeRoute === key ? "stroke-white-100" : defaultClassName)}
    size={20}
    color={activeRoute === key ? "#fff" : defaultColor}
  />
{:else if key === "positioning"}
  <Crosshair
    className={cn(activeRoute === key ? "stroke-white-100" : defaultClassName)}
    size={20}
    color={activeRoute === key ? "#fff" : defaultColor}
  />
{:else if key === "tech-stack-blueprint"}
  <Wrench
    className={cn(activeRoute === key ? "stroke-white-100" : defaultClassName)}
    size={20}
    color={activeRoute === key ? "#fff" : defaultColor}
  />
{:else if key === "user-persona"}
  <SquareUser
    className={cn(activeRoute === key ? "stroke-white-100" : defaultClassName)}
    size={20}
    color={activeRoute === key ? "#fff" : defaultColor}
  />
{:else if key === "research-tools"}
  <Radar
    className={cn(activeRoute === key ? "stroke-white-100" : defaultClassName)}
    size={20}
    color={activeRoute === key ? "#fff" : defaultColor}
  />
{:else if key === "content-generation-tools"}
  <Feather
    className={cn(activeRoute === key ? "stroke-white-100" : defaultClassName)}
    size={20}
    color={activeRoute === key ? "#fff" : defaultColor}
  />
{:else}
  {"N/A"}
{/if}
