<script>
  import { currentStep } from "../stores.js";
  export let step;

  let el;

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) currentStep.set(step);
    },
    {
      threshold: 0.2,
      rootMargin: "0px 0px -20% 0px"
    }
  );

  $: if (el) observer.observe(el);
</script>

<section bind:this={el} class="story-section" class:end-section={step === "end"}></section>

<style>
  .story-section {
    min-height: 100vh;
    scroll-snap-align: start;
    padding: 0;
    margin: 0;
    background: transparent;
  }
  
  /* The "end" observer should be shorter to trigger the transition quickly */
  .story-section.end-section {
    min-height: 30vh;
  }
</style>