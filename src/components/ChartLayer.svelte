<script>
  import { onMount } from "svelte";
  import { currentStep, storyActive } from "../stores.js";
  import { loadAllData, renderChord, updateChord } from "../lib/chord.js";

  let chartDiv;
  let labels = [];
  let matrix = [];

  // Auto-reactive store values
  $: step = $currentStep;
  $: isActive = $storyActive;

  onMount(async () => {
    const data = await loadAllData();
    labels = data.labels;
    matrix = data.matrix;
    renderChord(chartDiv, labels, matrix, step);
  });

  // Update chart whenever step changes
  $: if (labels.length) {
    updateChord(chartDiv, labels, matrix, step);
  }


  $: if (step === "end") {
    setTimeout(() => {
      storyActive.set(false);
    },650); 
  } else {
    storyActive.set(true);
  }

</script>

<div
  id="chart-layer"
  class:fixed={isActive}
  class:released={!isActive}
  class:shrunk={step !== "grayscale" && step !== "end"}

>
  <!-- HERO INSIDE CHART -->
  <div class="hero-overlay" class:hidden={step !== "grayscale"}>
    <div class="hero-box">
      <h1>Intersections of Hate</h1>
      <p>Explore structural intersections in Shhor AI data</p>
    </div>
  </div>

  <div bind:this={chartDiv} class="chart"></div>
</div>

<style>
  #chart-layer.fixed {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: auto;
    min-height: 70vh;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-top: 3vh;
    background: white;
    z-index: 10;
    transform-origin: center top;
    pointer-events: none;
    transition: transform 0.6s ease, height 0.6s ease;
  }

  #chart-layer.fixed.shrunk {
    transform: scale(0.82);
    height: auto;
    min-height: 60vh;
  }

  #chart-layer.released {
    position: relative;
    width: 100%;
    margin: 0 auto;
    padding: 2rem 0;
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: none;
    z-index: 1;
    background: white;
  }

  .chart {
    width: 1700px;
    max-width: 100%;
    height: 700px;
    overflow: visible;
  }

  #chart-layer {
    overflow: visible !important;
  }

  .hero-overlay {
    position: absolute;
    top: 57.5%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 50;
    pointer-events: none;
  }

  .hero-box {
    background: rgba(255, 255, 255, 0.85);
    padding: 1.5rem 2rem;
    border-radius: 10px;
    text-align: center;
    max-width: 700px;
  }

  .hero-box h1 {
    margin: 0 0 0.5rem;
    font-size: 2.8rem;
  }

  .hero-box p {
    margin: 0;
    font-size: 1.2rem;
    opacity: 0.75;
  }

  .hidden {
    display: none;
  }

  svg,
  #chart-layer,
  .chart {
    overflow: visible !important;
  }

  #chart-layer.fixed {
    transition: transform 0.6s ease, opacity 0.6s ease;
  }


  #chart-layer.released {
    opacity: 1 !important;
    transform: scale(1) !important;
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
 
 #chart-layer.released {
    margin-top: -2rem;
  }


</style>