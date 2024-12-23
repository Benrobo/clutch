import { useGlobalStore } from "@/store/global.store";

export function useBodyOverflow(shouldHideOverflow: boolean) {
  const globalStore = useGlobalStore();
  globalStore.toggleOverflowBody(shouldHideOverflow);
}
