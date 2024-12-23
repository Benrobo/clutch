<script lang="ts">
  import { Button as ButtonPrimitive } from "bits-ui";
  import { type VariantProps, tv } from "tailwind-variants";
  import { cn } from "$lib/utils";
  import Spinner from "../Spinner.svelte";

  const buttonVariants = tv({
    base: "ring-offset-background focus-visible:ring-ring inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border-input bg-background hover:bg-accent hover:text-accent-foreground border",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  });

  type Variant = VariantProps<typeof buttonVariants>["variant"];
  type Size = VariantProps<typeof buttonVariants>["size"];

  type Props = ButtonPrimitive.Props & {
    variant?: Variant;
    size?: Size;
    className?: $$Props["class"];
    isLoading?: boolean;
    spinnerSize?: number;
    spinnerClassName?: $$Props["class"];
    disabled?: boolean;
  };

  type Events = ButtonPrimitive.Events;

  type $$Events = Events;
  type $$Props = Props;

  export let variant: Props["variant"] = "default";
  export let size: Props["size"] = "default";
  export let builders: Props["builders"] = [];
  export let className: Props["class"] = undefined;
  export let isLoading: boolean = false;
  export let spinnerSize: number = 20;
  export let spinnerClassName: $$Props["class"] = undefined;
  export let disabled: boolean = false;
  const mergedClass = cn(buttonVariants({ variant, size, className }));
</script>

<ButtonPrimitive.Root
  {builders}
  class={mergedClass}
  type="button"
  {...$$restProps}
  disabled={isLoading || disabled}
  on:click
  on:keydown
>
  {#if isLoading}
    <Spinner
      className={cn(
        `${spinnerClassName}`,
        isLoading ? "opacity-100" : "opacity-0"
      )}
      size={`${spinnerSize}`}
    />
  {/if}
  <slot />
</ButtonPrimitive.Root>
