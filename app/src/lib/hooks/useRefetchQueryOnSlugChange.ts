// // src/hooks/useRefetchOnSlugChange.ts
// import { createQuery as useQuery } from "@tanstack/svelte-query";

// export function useRefetchOnSlugChange(
//   queryKey: string[],
//   queryFn: () => Promise<any>,
//   slug: string
// ) {
//   const query = useQuery({
//     queryKey,
//     queryFn,
//     enabled: !!slug, // Only enable the query if slug is available
//   });

//   // Refetch only if slug changes
//   $: if (slug && slug !== queryKey[1]) {
//     // Compare with the slug in the queryKey
//     query.refetch(); // Refetch the query
//   }

//   return { query };
// }

// src/hooks/useRefetchOnSlugChange.ts
import { derived, writable, type Readable } from "svelte/store";
import { createQuery } from "@tanstack/svelte-query";
import { page } from "$app/stores";

export function useRefetchOnSlugChange(
  queryKey: string[],
  queryFn: () => Promise<any>
) {
  const slug = derived(page, ($page) => $page.url.pathname.split("/")[3]);
  let previousSlug: Readable<string | null> = writable(null);

  const query = createQuery({
    queryKey: queryKey,
    queryFn: queryFn,
    enabled: !!slug,
  });

  // Refetch only if slug changes
  $: if (slug && slug !== previousSlug) {
    previousSlug = slug; // Update previousSlug
    query.subscribe((q) => q.refetch());
  }

  return { query };
}
