<script lang="ts">
  import { browser } from "$app/environment";

  let component = undefined;

   $: if(browser) {
       import("./Pixi.svelte").then(data => {
           component = data.default
       });
   }

   $: console.log({ component });
</script>

abc

{#if browser && component}
    <svelte:component this={component} />
{/if}
