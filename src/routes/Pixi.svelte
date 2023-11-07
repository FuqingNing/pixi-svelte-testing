<script lang="ts">
  import { App, Text, setAppContext, createApp } from "pixi-svelte";

  const context = createApp();

  setAppContext(context);
</script>

<App>
    <Text value="Hello world." />
</App>
