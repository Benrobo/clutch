import type { User } from "@/types/auth";
import { writable } from "svelte/store";

export type AuthStore = {
  user: User | null;
  isLoading: boolean;
};

export const authStore = writable<AuthStore>({
  user: null,
  isLoading: true,
});
