<script>
  export let contentFunction;
</script>

{#if contentFunction}
  {@html contentFunction()}
{/if}
