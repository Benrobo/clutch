<script lang="ts">
  import * as Select from "$lib/components/ui/select";
  import { cn } from "$lib/utils";
  import Flex from "@/components/Flex.svelte";
  import { Package, ChevronDown } from "lucide-svelte";
</script>

<Select.Root>
  <Select.Trigger
    class="w-full h-[30px] rounded-sm bg-dark-106 border-none outline-none ring-0 flex items-center justify-between hover:bg-dark-107/60 transition-all py-0 px-1"
  >
    <Flex className="w-full h-full justify-start items-center">
      <span>
        <img src="/scribe.svg" alt="logo" class="w-[25px]" />
      </span>
      <span class="text-xs text-white-300 font-jetbrains">Project Name</span>
    </Flex>
    <ChevronDown size={16} class="stroke-white-400" />
  </Select.Trigger>
  <Select.Content>
    <Select.Item value="light">Light</Select.Item>
    <Select.Item value="dark">Dark</Select.Item>
    <Select.Item value="system">System</Select.Item>
  </Select.Content>
</Select.Root>
