<script lang="ts">
  import { CreditCard, Zap, Coins } from "lucide-svelte";
  import Modal from "@/components/Modal.svelte";
  import Flex from "@/components/Flex.svelte";
  import { createMutation, createQuery } from "@tanstack/svelte-query";
  import { getCreditPurchaseConfig, purchaseCredits } from "@/http/requests";
  import Divider from "@/components/Divider.svelte";
  import { cn, extractAxiosResponseData, numberToCurrency } from "@/utils";
  import type { CreditTopUpConfigType } from "@/types/subscription.types";
  import { useGlobalStore } from "@/store/global.store";
  import Loader from "@/components/Loader.svelte";
  import type { BaseResponse } from "@/types";
  import toast from "svelte-french-toast";

  $: globalStore = useGlobalStore();

  let selectedPackage:
    | CreditTopUpConfigType["availablePackages"][number]
    | null = null;

  $: creditConfigQuery = createQuery({
    queryKey: ["credit-purchase-config"],
    queryFn: getCreditPurchaseConfig,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    retryOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  $: creditPurchaseMut = createMutation({
    mutationFn: async (c: number) => await purchaseCredits(c),
    onSuccess: (resp) => {
      const data = extractAxiosResponseData(resp, "success")
        ?.data as unknown as { url: string };
      const url = data?.url;
      if (url) {
        window.open(url, "_blank");
      }
    },
    onError: (error: any) => {
      console.error(error);
      toast.error("Failed to purchase credits");
    },
  });

  $: packages = $creditConfigQuery.data?.data?.availablePackages ?? [];
  $: selectedPackage = selectedPackage || packages[0];

  function handleTopUp() {
    if ($creditPurchaseMut.isPending) return;
    $creditPurchaseMut.mutate(selectedPackage?.credits ?? 0);
  }

  function handlePackageChange(pkg: (typeof packages)[number]) {
    selectedPackage = pkg;
  }
</script>

<Modal
  on:close={() => {
    globalStore.toggleCreditTopUpModal(false);
  }}
  closeOnClickOutside={true}
  show={$globalStore?.creditTopUpModal}
  showCloseButton={true}
>
  <Flex
    className="w-[450px] h-full max-w-[450px] flex-col bg-dark-106 border-[1px] border-gray-101/30 rounded-[12px] relative font-jetbrains"
  >
    <Flex className="w-full items-center justify-start gap-3 px-4 pt-2 py-4">
      <Zap size={20} class="stroke-white-100" />
      <h1 class="text-white-100 font-poppins font-semibold text-xl">
        Top Up Credits
      </h1>
    </Flex>
    <Divider />
    {#if $creditConfigQuery.isLoading}
      <Loader className="py-2" />
    {:else}
      <div class="w-full h-full grid grid-cols-2 gap-4 px-4 py-5">
        {#each packages as pkg}
          <button
            on:click={() => handlePackageChange(pkg)}
            class={cn(
              "w-full h-[150px] flex flex-col items-center justify-center gap-2 px-4 py-2 rounded-lg border-[1px] border-gray-101 transition-all",
              selectedPackage?.credits === pkg.credits
                ? "border-orange-100 bg-orange-100/5"
                : "border-white-400/30 bg-dark-107/50"
            )}
          >
            <Flex>
              <Coins size={20} class="stroke-white-100" />
              <h1 class="text-white-100 font-poppins font-semibold text-[2em]">
                {pkg.credits}
                <sup class="text-xs font-light text-white-100/50">credits</sup>
              </h1>
            </Flex>
            <p class="text-white-100 font-poppins font-normal text-sm">
              {numberToCurrency(pkg.qty * pkg.price)}
            </p>
          </button>
        {/each}
      </div>

      <Divider />

      <Flex className="w-full px-4 py-4">
        <button
          on:click={handleTopUp}
          class="w-full bg-blue-100 hover:bg-blue-101 text-white transition-colors duration-200 py-3 px-4 rounded-md flex items-center justify-center text-white-100 gap-3 text-[13px] disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale"
          disabled={$creditPurchaseMut.isPending}
        >
          {#if $creditPurchaseMut.isPending}
            <Loader />
          {:else}
            <CreditCard size={20} />
            Top Up {selectedPackage?.credits} Credits for
            {numberToCurrency(
              (selectedPackage?.qty ?? 0) * (selectedPackage?.price ?? 0)
            )}
          {/if}
        </button>
      </Flex>
    {/if}
  </Flex>
</Modal>
