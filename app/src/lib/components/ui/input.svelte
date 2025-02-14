<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";
  import { cn } from "$lib/utils";
  import Flex from "../Flex.svelte";

  type FormInputEvent<T extends Event = Event> = T & {
    currentTarget: EventTarget & HTMLInputElement;
  };

  type InputEvents = {
    blur: FormInputEvent<FocusEvent>;
    change: FormInputEvent<Event>;
    click: FormInputEvent<MouseEvent>;
    focus: FormInputEvent<FocusEvent>;
    focusin: FormInputEvent<FocusEvent>;
    focusout: FormInputEvent<FocusEvent>;
    keydown: FormInputEvent<KeyboardEvent>;
    keypress: FormInputEvent<KeyboardEvent>;
    keyup: FormInputEvent<KeyboardEvent>;
    mouseover: FormInputEvent<MouseEvent>;
    mouseenter: FormInputEvent<MouseEvent>;
    mouseleave: FormInputEvent<MouseEvent>;
    mousemove: FormInputEvent<MouseEvent>;
    paste: FormInputEvent<ClipboardEvent>;
    input: FormInputEvent<InputEvent>;
    wheel: FormInputEvent<WheelEvent>;
  };

  type $$Props = HTMLInputAttributes & {
    label?: string;
  };
  type $$Events = InputEvents;

  let className: $$Props["class"] = undefined;
  export let value: $$Props["value"] = undefined;
  export { className as class };

  // Workaround for https://github.com/sveltejs/svelte/issues/9305
  // Fixed in Svelte 5, but not backported to 4.x.
  export let readonly: $$Props["readonly"] = undefined;
  export let label: $$Props["label"] = undefined;
</script>

<Flex className="w-full h-auto flex-col items-start justify-start">
  {#if label}
    <label class="text-sm text-white-400/50" for={label}>{label}</label>
  {/if}
  <input
    class={cn(
      "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    bind:value
    {readonly}
    on:blur
    on:change
    on:click
    on:focus
    on:focusin
    on:focusout
    on:keydown
    on:keypress
    on:keyup
    on:mouseover
    on:mouseenter
    on:mouseleave
    on:mousemove
    on:paste
    on:input
    on:wheel|passive
    {...$$restProps}
  />
</Flex>
