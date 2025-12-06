<script>
  import { onMount } from "svelte";
  import ChartLayer from "./components/ChartLayer.svelte";
  import TextPanel from "./components/TextPanel.svelte";
  import Article from "./components/Article.svelte";
  import { currentStep } from "./stores.js";

  $: step = $currentStep;


  const textMap = {
    intro: `
      <p>Shhor identifies eight distinct categories: <strong>Queerphobic, Gendered, Communal, Political, Casteist, Ableist, Racist, and General hate.</strong></p>
    <p>The analysis excludes General hate—reserved for harmful content that doesn't intersect with the other seven categories.</p>

      `,
    sexist: `
      <h4>Gender Violence Never Travels Alone</h4>
<p>When Shhor examined sexist comments closely, patterns emerged:<span class="stat-highlight">36.4%</span> also contain communal hatred, <span class="stat-highlight">20.0%</span> intersect with political targeting.</p>
<p>A Muslim woman discussing politics faces misogyny twisted with Islamophobia and political hatred. A Dalit trans person encounters queerphobia braided with caste slurs.
<strong><em>The violence multiplies.</em></strong></p>
    `,
    political: `
      <h4>Political and communal hate form strong bidirectional flows.</h4>
      <p>The India Hate Lab documented 1,165 hate speech events targeting religious minorities in 2024—a 74.4% increase from 2023. Half referenced conspiracy theories: "love jihad," "land jihad," "vote jihad." Manufactured electoral tools painting Muslims and Christians as existential threats.</p>
      <p>In Shhor's data: 51% of political comments also carry communal hate. Add the spillover from gendered-political-communal intersections, and the pattern hardens into strategy.</p>
    `,
    full: `
      <h4>Hate is never isolated</h4>
      <p>Casteism requires misogyny to function. Communal violence depends on patriarchy. Protecting LGBTQ+ communities means confronting how queerphobia weaponizes caste and religion.</p>
      <p>Every hate category in Shhor's taxonomy intersects with others. Hate targeting one identity almost always carries traces—or direct attacks—against other identities.</p>
      <h4>Solutions cannot be siloed. Building for the most marginalized creates safety for everyone.</h4>
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
      <h3>There Is No Single-Issue Oppression</h3>
      <p>Kimberlé Crenshaw coined the term <em>intersectionality</em> in 1989: systems of oppression interlock, creating unique experiences for people living at those junctures. In India, where caste, religion, gender, class, and region weave dense hierarchies, <strong>intersectionality isn't academic theory. It's survival knowledge.</strong></p>
    </div>
  </div>

  <!-- ARTICLE: Starts immediately after scrolly -->
  <Article>
    <!-- your existing article content -->

<p>Dalit feminists built on Ambedkar's analysis of how caste persists through controlling and sexually exploiting women. Mainstream Indian feminism centered upper-caste concerns while sidelining how caste and religion shape violence. The Dalit movement often treated women's specific oppressions as secondary to caste struggle.</p>

<p>But Dalit women, Muslim women, trans folks, disabled people—those living at multiple intersections—understand their oppressions cannot be separated. <u>A Dalit woman's sexual assault is both casteist and sexist violence.</u> <u>A Muslim trans person attacked online faces queerphobia, Islamophobia, and misogyny simultaneously.</u></p>

<div class="callout-box">
<p><strong>Shhor refuses to treat hate as singular.</strong> Every comment receives tags for <em>all</em> identities it attacks. Every analysis searches for intersection patterns. Pretending oppression is single-issue abandons those holding multiple marginalized identities—the people needing protection most. The data proves it. Lived experiences demand it. Liberation requires intersectionality.</p>
</div>

<h2>Intersections Are the Norm, Not the Exception</h2>

<p>Among comments with some form of intersection, <span class="stat-highlight"><strong>85% had at least two categories of hate intersecting</strong></span>, and <span class="stat-highlight"><strong>approximately 15% had three or more intersections</strong></span>—which is not a small number by any margin. These numbers demonstrate that the vast majority of online hate speech doesn't target a single identity but attacks multiple aspects of a person's being simultaneously.</p>

    <figure class="article-image">
      <img src="./assets/donut.png" alt="Donut Chart: The Entanglement of Hate" />
    </figure>

<p>The chord chart reveals how interconnected online hate speech is across different forms of marginalization. Each arc represents a category of hate, and the ribbons between them show how frequently they co-occur in the same comments. The thickness of each ribbon corresponds to the frequency of that particular intersection.</p>

<p><em>This visualization's goal is to show how all these forms of marginalization intersect and impact individuals.</em> Online hate is not as simple as some people make it out to be—it's messy, entangled, and targets multiple identities at once.</p>


<p>If you want more clarity and structure showing the largest intersections clearly, the UpSet plot displays them systematically. This chart type reads left-to-right: the bar chart on the left shows the frequency of each hate category, while the connected dots in the matrix show which categories co-occur, with the bar chart above indicating how many comments contain that specific combination.</p>

<p>Though the full chart contains numerous elements that make it challenging to read in a data story or dashboard, the dots reveal a clear pattern. <strong>The majority of the most frequent intersections appear in the top 10 combinations</strong>, and all except one—<em>political-communal-sexist</em>, the highest three-category intersection—contain only two-category combinations. Still, you can see that there are countless other intersection types beyond these dominant patterns.</p>

<figure class="article-image">
      <img src="./assets/upset.png" alt="Intersection Complexity Increases with Multiple Categories" />
    </figure>

<p>The bar chart adjacent to the UpSet plot shows that <u>the number of unique intersection types is higher among comments with three or more intersections</u>. While comments with two intersections form a limited set of predictable patterns, those attacking three or more identities generate exponentially more combinations. This demonstrates that as hate becomes more virulent and targets more identities, it also becomes more varied and unpredictable in how it manifests.</p>

<figure class="article-image">
      <img src="./assets/heatmap.png" alt="Category Association Strength (Phi Coefficient)" />
    </figure>

<p>This heat map measures the statistical correlation between hate speech categories using the phi coefficient, which ranges from -1 to +1. Positive values (orange/red) indicate categories that frequently co-occur in the same comments, while negative values (blue) indicate categories that rarely appear together. Values near zero (light gray) suggest independence between categories.</p>

<p>The heat map reveals critical patterns about how different forms of hate intersect—and when they don't. <strong>The strongest positive association appears between casteist and racist hate (φ = 0.216)</strong>, suggesting that comments attacking someone's caste often simultaneously deploy racial or xenophobic slurs, particularly against Adivasi communities. This reflects how caste hierarchies and racial discrimination are deeply intertwined in Indian contexts, where upper-caste supremacy often manifests through both casteist and racist language.</p>

<h2>How the Numbers Were Built</h2>

<p>Shhor constructed its dataset from <strong>45,000 comments</strong> scraped from Indian social media between <strong>October 2022 and April 2024</strong>. The focus: public comments shaping culture and normalizing violence. Multiple platforms, multiple languages—primarily English and Hinglish—capturing everything from "dank" jokes to explicit threats.</p>

<p>They weaponized the abuse they and their fellow marginalized activists and artists were receiving. Through an Instagram post, they invited others to share links to their own posts where they were targeted. Aindriya created a scraper to automatically collect these hate comments.</p>

<h3>The Categories</h3>

<p>Eight types of hate were identified:</p>

<ol>
    <li><strong>Sexist</strong> (sexism, misogyny, normalized sexist slurs)</li>
    <li><strong>Queerphobic</strong> (queerphobia, transphobia)</li>
    <li><strong>Communal Hate</strong> (religious bigotry, primarily Islamophobia and anti-Christian hate)</li>
    <li><strong>Political Hate</strong> (targeting based on views, party affiliation, activism)</li>
    <li><strong>Caste</strong> (casteism, anti-Dalit, anti-Adivasi slurs)</li>
    <li><strong>Race</strong> (xenophobia, hate against Adivasi culture)</li>
    <li><strong>Disability</strong> (ableism, ableist slurs)</li>
    <li><strong>General</strong> (harmful content outside other categories)</li>
</ol>

<p>Each comment received manual review and could carry multiple tags for intersecting hatreds. <em>A comment calling a Muslim woman politician a communal slur gets tagged as "communal hate," "political hate," and "sexist hate."</em></p>

<h3>The Annotation Method</h3>

<p>Aindriya faced the daunting task of manually reading and marking thousands of ugly comments as hate or not, and further categorizing them. The task was enormous. But so was Aindriya's determination. They knew they couldn't tag thousands of comments themself, so Aindriya reached out to their allies on Instagram.</p>

<p>Soon, support started pouring in. They mobilized and created a community of about <strong>45 volunteers</strong> from downtrodden backgrounds with lived experiences to understand the hate. <em>I am one of them too.</em> We all marched ahead, following Aindriya's guidelines, with a shared dream: 🌻 <strong>A SAFER INTERNET FOR ALL</strong> 🌻</p>

<div class="callout-box">
<p><strong>Who annotates determines what gets labeled.</strong> Upper-caste annotators miss casteist microaggressions. Men often don't recognize subtle misogyny. Annotators—many holding marginalized identities themselves—were trained to recognize hate in covert and overt forms.</p>
</div>

<p>Guidelines adapted existing hate speech research for Indian contexts, including:</p>

<ul>
    <li>Explicit slurs and violent language</li>
    <li>Coded language and dog whistles ("Sulli," "Bulla," "reservation quota")</li>
    <li>Dehumanizing comparisons</li>
    <li>Incitement to violence or boycott</li>
    <li>Sexualized abuse and rape threats</li>
    <li>Mockery and dismissal of marginalized identities</li>
</ul>

<p>Till now, they have accumulated <strong>India's most extensive Hinglish real-world dataset of 45,000+ comments</strong> and used it in first-of-its-kind research. Using the data, they trained a high-end AI model. Aindriya's groundbreaking work won them acclaim from around the world.</p>

<h2>The Calculations</h2>

<h3>Context</h3>

<ol>
    <li>For this analysis, the "general hate" category was removed to focus on specific identity-based hate</li>
    <li>Only comments tagged as hate and containing at least one intersection were considered; data with no intersections were excluded from this particular analysis</li>
</ol>

<h3>How the Percentages Were Calculated</h3>

<p>The 85% and 15% figures represent the distribution of intersection complexity among hate comments:</p>

<ul>
    <li><strong>Total hate comments with intersections</strong>: The subset of the 45,000 comments that contained multiple hate categories</li>
    <li><strong>Two-category intersections</strong>: Comments tagged with exactly two hate categories (e.g., sexist + communal hate)</li>
    <li><strong>Three-or-more-category intersections</strong>: Comments tagged with three, four, or more hate categories</li>
</ul>

<p>The calculation:</p>

<p><strong>Percentage = (Number of comments with <em>n</em> categories / Total comments with any intersection) × 100</strong></p>

<p>Where 85% had <em>n</em> = 2 categories and 15% had <em>n</em> ≥ 3 categories.</p>

<h3>Understanding the Phi Coefficient and Heat Map</h3>

<p>The phi coefficient (φ) measures the association between two binary variables—in this case, the presence or absence of two hate categories within the same comment. The phi coefficient ranges from -1 to +1:</p>

<ul>
    <li><strong>φ = +1</strong>: Perfect positive association (when one category appears, the other always appears)</li>
    <li><strong>φ = 0</strong>: No association (the categories appear independently)</li>
    <li><strong>φ = -1</strong>: Perfect negative association (when one appears, the other never appears)</li>
</ul>

<p>For Shhor's data, the phi coefficient is calculated for each pair of hate categories:</p>

<p><strong>φ = [(n₁₁ × n₀₀) - (n₁₀ × n₀₁)] / √[(n₁₁ + n₁₀)(n₀₁ + n₀₀)(n₁₁ + n₀₁)(n₁₀ + n₀₀)]</strong></p>

<p>Where:</p>
<ul>
    <li><em>n₁₁</em> = comments containing both categories</li>
    <li><em>n₁₀</em> = comments containing only the first category</li>
    <li><em>n₀₁</em> = comments containing only the second category</li>
    <li><em>n₀₀</em> = comments containing neither category</li>
</ul>

<p>The heat map visualizes these phi coefficients across all category pairs, with color intensity representing association strength. <u>Darker/warmer colors indicate stronger associations—hate categories that frequently co-occur.</u> This reveals which forms of hate most often combine to create intersectional attacks.</p>

<h2>Why This Data Exists</h2>

<p>Most hate speech research in India focuses on single categories—sexism <em>or</em> communal hate <em>or</em> casteism. Few studies track intersections. Fewer still are built by and for marginalized communities.</p>

<div class="callout-box">
<p>As Aindriya, Shhor's founder, states: <em>"Shhor AI's dataset exists because the need was urgent. Big-tech platforms fail marginalized communities. The state criminalizes their speech while ignoring hate targeting them."</em></p>
</div>

<p><strong>This data is ammunition. Proof. Receipts</strong> for when someone claims, "It's not that bad," or "You're being too sensitive," or "Why make everything about identity?"</p>

<p><u>The numbers say: The violence is real, measurable, and everywhere.</u></p>

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
    line-height: 1.4;
    font-size: 1.15rem;
  }

  .caption-inner {
    max-width: 1060px;        
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
