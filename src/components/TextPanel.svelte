<script>
  import { currentStep } from "../stores.js";
  export let textMap = {};

  let step = "grayscale";
  $: currentStep.subscribe((v) => (step = v));
</script>

{#if step !== "grayscale" && step !== "end"}
<div id="text-panel">
  <div class="inner">
    {@html textMap[step] || ""}
  </div>
</div>
{/if}

<style>
  #text-panel {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100vw;
    height: 22vh;          
    background: white;
    color: black;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1.5rem 1rem;
    z-index: 30;

    border-top: none;
    box-shadow: none;
  }

  .inner {
    max-width: 1100px;
    line-height: 1.3;
    text-align: center;
    font-size: 1rem;
  }
</style>

