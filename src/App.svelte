<script>
  import { onMount } from "svelte";
  import ChartLayer from "./components/ChartLayer.svelte";
  import TextPanel from "./components/TextPanel.svelte";
  import Article from "./components/Article.svelte";
  import { currentStep } from "./stores.js";

  $: step = $currentStep;


  const textMap = {
    intro: `
      <h2>Types of Hate Speech</h2>
      <p>Shhor classifies seven major forms of hate speech.</p>
    `,
    sexist: `
      <h2>Sexist Hate</h2>
      <p>Sexist hate intersects heavily with political, communal and casteist abuse.</p>
    `,
    political: `
      <h2>Political & Communal Hate</h2>
      <p>Political and communal hate form strong bidirectional flows.</p>
    `,
    full: `
      <h2>Interactive Mode</h2>
      <p>Hover over categories to explore all intersections.</p>
    `
  };

  let scrollySection;
  let inScrolly = true; 

  const orderedSteps = ["grayscale", "intro", "sexist", "political", "full", "end"];
  
  // --- SCROLL → STEP MAPPING ---
  onMount(() => {
    const handleScroll = () => {
      if (!scrollySection) return;

      const rect = scrollySection.getBoundingClientRect();

      inScrolly = rect.bottom > 0;

      const scrollyHeight = scrollySection.offsetHeight;
      const windowHeight = window.innerHeight;

      // progress: 0–1 through the scrollySection
      const progress = Math.max(
        0,
        Math.min(1, -rect.top / (scrollyHeight - windowHeight))
      );

      if (progress < 0.16) {
        currentStep.set("grayscale");
      } else if (progress < 0.33) {
        currentStep.set("intro");
      } else if (progress < 0.5) {
        currentStep.set("sexist");
      } else if (progress < 0.66) {
        currentStep.set("political");
      } else if (progress < 0.83) {
        currentStep.set("full");
      } else {
        currentStep.set("end");
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // initial

    return () => window.removeEventListener("scroll", handleScroll);
  });

  // Helper: scroll viewport to match a step index
  function scrollToStep(index) {
    if (!scrollySection) return;

    const scrollyHeight = scrollySection.offsetHeight;
    const windowHeight = window.innerHeight;
    const progress = index / (orderedSteps.length - 1);
    const targetY = progress * (scrollyHeight - windowHeight);

    window.scrollTo({ top: targetY, behavior: "smooth" });
  }

  // --- BUTTON / KEYBOARD STEP CONTROLS ---
  function nextStep() {
    const current = orderedSteps.indexOf($currentStep);
    const nextIndex = Math.min(current + 1, orderedSteps.length - 1);
    currentStep.set(orderedSteps[nextIndex]);
    scrollToStep(nextIndex);
  }

  function prevStep() {
    const current = orderedSteps.indexOf($currentStep);
    const prevIndex = Math.max(current - 1, 0);
    currentStep.set(orderedSteps[prevIndex]);
    scrollToStep(prevIndex);
  }

  // Keyboard: arrows and PageUp/PageDown
  onMount(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        nextStep();
      }

      if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        prevStep();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });
</script>

<div class="page-wrapper">
  <!-- Up/Down buttons -->
  <div class="step-buttons" class:hidden={step === "end"}>
    <button class="arrow-btn up" on:click={prevStep}>↑</button>
    <button class="arrow-btn down" on:click={nextStep}>↓</button>
  </div>

  <div class="scroll-hint" class:hidden={step === "end"}>
    Scroll / Press ↑ ↓
  </div>

  <div class="end-hint" class:hidden={!inScrolly || step !== "end"}>
    Scroll down to read more ↓
  </div>


  <!-- SCROLLY SECTION: Fixed total height -->
  <div class="scrolly-section" bind:this={scrollySection}>
    <div class="sticky-container">
      <ChartLayer />
      <TextPanel {textMap} />
    </div>
  </div>

  <div class="chart-caption" class:fadein={step === "end"}>
    <div class="caption-inner">
      <h3>Complete Intersection Map</h3>
      <p>
        This chord diagram visualizes all intersections between hate speech categories in the Shhor AI dataset.
        Hover over any category to explore its connections with other forms of hate speech. imberlé Crenshaw defined "intersectionality" in 1989 as the insight that systems of oppression interlock,
      producing distinct and compounded forms of discrimination for people who live at those intersections.
      In India, where caste, religion, gender, class, and region interact to shape social life, intersectionality is practical knowledge:
      it guides how people experience and survive discrimination.
      </p>
    </div>
  </div>

  <!-- ARTICLE: Starts immediately after scrolly -->
  <Article>
    <!-- your existing article content -->
    <p>
      Kimberlé Crenshaw defined "intersectionality" in 1989 as the insight that systems of oppression interlock,
      producing distinct and compounded forms of discrimination for people who live at those intersections.
      In India, where caste, religion, gender, class, and region interact to shape social life, intersectionality is practical knowledge:
      it guides how people experience and survive discrimination.
    </p>

    <p>
      Dalit feminists and scholars have long described how caste and gender are mutually constitutive. Ambedkar's work, and subsequent
      interventions, situate the control and exploitation of women as pivotal to the reproduction of caste hierarchies.
      Mainstream feminist movements in India have often centered concerns of upper-caste women; the consequences of caste and religion
      on women's experiences of violence can remain under-examined unless intersectional frameworks are applied.
    </p>

    <p>
      People who live at multiple intersections — Dalit women, Muslim women, trans people, and disabled people — often report that their
      oppressions cannot be separated. When a Dalit woman experiences sexual violence, the incident is simultaneously casteist and sexist.
      When a Muslim trans person encounters online abuse, the attack is frequently queerphobic, communal, and gendered at the same time.
    </p>

    <p>
      Shhor AI's approach treats hate as multi-dimensional. Each comment is tagged for all identities it targets, and analyses prioritize overlapping
      patterns. Omitting intersectional harms in research or policy risks leaving the most vulnerable unprotected.
    </p>

    <h3>Methodology, Data, and What the Numbers Mean</h3>

    <p>
      The dataset underpinning this visualisation comprises 45,000 public comments collected from Indian social platforms between October 2022
      and April 2024. The sample focuses on public discourse where marginalised communities are discussed: political threads, conversations about gender
      and sexuality, caste-related debates, disability discourse, and discussions about Indigenous or racialised communities.
    </p>

    <p>
      Comments were tagged with multiple categories when applicable. This matters: a single comment that uses communal language toward a woman,
      for example, is recorded as both communal and gendered hate.
    </p>

    <p>
      Annotation was performed by trained coders, many of whom hold marginalised identities themselves. Research on classification shows that who annotates
      data affects what is counted; diverse and context-aware annotation reduces the risk of erasing forms of harm such as casteist microaggressions.
    </p>

    <p>
      Intersection percentages (for example, "36.4% of sexist comments also contain communal language") are calculated by dividing the number of comments
      with both tags by the total number of comments that have the first tag — a simple conditional proportion.
    </p>

    <p>
      As spokespersons associated with the dataset note: the numbers provide evidence that online hate is measurable and patterned — a resource
      for advocates, researchers, and platform designers seeking to build targeted, intersectional responses.
    </p>
  </Article>
</div>

<style>
  .page-wrapper {
    width: 100%;
  }

  .scrolly-section {
    position: relative;
    /* Fixed height: 6 steps × 100vh = 600vh of scroll distance */
    height: 600vh;
    width: 100%;
  }

  .sticky-container {
    position: sticky;
    top: 0;
    width: 100%;
    height: 100vh;
    background: white;
    z-index: 10;
  }

  .step-buttons {
    position: fixed;
    right: 1.6rem;
    bottom: 4.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    z-index: 2000;
  }

  .arrow-btn {
    background: rgba(0, 0, 0, 0.14);
    color: #111;
    border: none;
    padding: 0.4rem 0.7rem;
    border-radius: 6px;
    font-size: 1.4rem;
    cursor: pointer;
    backdrop-filter: blur(4px);
  }

  .arrow-btn:hover {
    background: rgba(0, 0, 0, 0.22);
  }

  .scroll-hint {
    position: fixed;
    right: 2rem;
    bottom: 2.2rem;
    font-size: 0.9rem;
    color: rgba(0, 0, 0, 0.55);
    z-index: 2000;
    pointer-events: none;
  }

  .end-hint {
    position: fixed;
    bottom: 25.8rem;
    left: 90%;
    transform: translateX(-50%);
    font-size: 1rem;
    color: rgba(0,0,0,0.65);
    background: rgba(255,255,255,0.7);
    padding: 0.4rem 0.8rem;
    border-radius: 4px;
    z-index: 2000;
    backdrop-filter: blur(6px);
  }

  .hidden {
    display: none !important;
  }

  .chart-caption {
    width: 100%;
    display: flex;
    justify-content: center;
    padding-bottom: 0.2rem;
    line-height: 1.8;
    font-size: 1.15rem;
  }

  .caption-inner {
    max-width: 800px;        
    width: 100%;
    padding: 0 1rem;        
  }

  .chart-caption,
article {
  position: relative;
  margin-top: -8vh;  
  z-index: 30;
}

.chart-caption {
  opacity: 0;
  transition: opacity 0.6s ease;
}

.chart-caption.fadein {
  opacity: 1;
}



</style>
