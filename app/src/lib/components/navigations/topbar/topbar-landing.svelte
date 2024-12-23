<script lang="ts">
  import Flex from "@/components/Flex.svelte";
  import { useBodyOverflow } from "@/hooks/useBodyOverflow";
  import { cn } from "@/utils";
  import Equal from "lucide-svelte/icons/equal";
  import X from "lucide-svelte/icons/x";

  import { afterUpdate } from "svelte";
  import AuthButton from "@/modules/auth/AuthButton.svelte";

  const navRoutes = [
    {
      title: "Pricing",
      path: "/#pricing",
    },
    {
      title: "FAQ",
      path: "/#faq",
    },
  ];

  $: menuOpen = false;
  $: useBodyOverflow(menuOpen);

  afterUpdate(() => {});
</script>

<div class="w-full h-auto z-[1000] fixed top-0 left-0">
  <Flex
    className={cn(
      "w-full h-auto max-h-[50px] py-8 px-5 items-center justify-between border-b-[.5px] border-transparent bg-transparent backdrop-blur-sm",
      "border-b-white-400/10"
    )}
  >
    <!-- branding -->
    <Flex className="w-full items-center">
      <span>
        <img src="/scribe-logo.svg" alt="logo" class="w-[25px]" />
      </span>
      <h1 class="text-white-100 font-light font-brunoace text-md">ScribeAI</h1>
    </Flex>

    <!-- right sections -->
    <Flex className="w-full items-center justify-end">
      {#each navRoutes as route}
        <a
          href={route.path}
          class="hidden sm:flex text-sm text-white-100 font-normal px-3 py-2 rounded-[10px] transition-all hover:bg-dark-106 border-[.5px] border-transparent hover:border-white-400/30"
        >
          {route.title}
        </a>
      {/each}

      <Flex className="w-auto items-center justify-center ml-10">
        <!-- <button
        class={cn(
          "hidden sm:flex text-[13px] text-white-100 font-poppins font-medium px-4 py-2 rounded-lg transition-all enableBounceEffect text-nowrap",
          user?.avatar
            ? "bg-dark-106"
            : "hover:bg-orange-102 bg-gradient-to-b from-orange-102 from-50% to-orange-103"
        )}
      >
        {#if user?.avatar}
          Dashboard
        {:else}
          Sign In
        {/if}
      </button> -->
        <AuthButton
          authText="Dashboard"
          unauthText="Sign In"
          onClick={() => {
            menuOpen = false;
          }}
          shouldRedirectAuth={true}
          className="sm:flex-center"
        />

        <button
          class="flex sm:hidden w-[30px] h-[30px] flex-center rounded-full enableBounceEffect transition-all border-transparent hover:bg-dark-106 border-[.5px] hover:border-white-400/30"
          on:click={() => (menuOpen = !menuOpen)}
        >
          {#if menuOpen}
            <X size={18} />
          {:else}
            <Equal size={20} />
          {/if}
        </button>
      </Flex>
    </Flex>
  </Flex>

  <Flex
    className={cn(
      "w-full h-0 flex flex-col items-center justify-start overflow-hidden transition-all bg-dark-107 px-3 sm:hidden",
      menuOpen ? "h-[100vh]" : "h-0"
    )}
  >
    <Flex className="w-full h-auto flex-col items-center justify-start gap-0">
      {#each navRoutes as route}
        <a
          href={route.path}
          class="w-full text-md text-white-100 font-normal px-3 py-2 rounded-md transition-all hover:bg-dark-106 border-[.5px] border-transparent hover:border-white-400/30"
        >
          {route.title}
        </a>
      {/each}
    </Flex>
    <br />
    <!-- <button
    class={cn(
      "w-full flex-center gap-3 text-[sm] text-white-100 font-poppins font-medium px-4 py-3 rounded-lg transition-all enableBounceEffect text-nowrap",
      user?.avatar
        ? "bg-dark-106"
        : "hover:bg-orange-102 bg-gradient-to-b from-orange-102 from-50% to-orange-103"
    )}
  >
    {#if user?.avatar}
      Dashboard
    {:else}
      Free Trial
    {/if}

    <MoveRight size={20} class="stroke-white-100" />
  </button> -->

    <AuthButton
      authText="Dashboard"
      unauthText="Free Trial"
      className="flex w-full flex-center text-sm py-3 gap-3"
      onClick={() => {
        menuOpen = false;
      }}
    />
  </Flex>
</div>
