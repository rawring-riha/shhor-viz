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

      explainer: `
  <h4>Reading the Chord Chart</h4>
  <p><span style="display: inline-block; width: 60px; height: 20px; background: linear-gradient(to right, #b07bea, #f1e128); border-radius: 3px; vertical-align: middle; margin-right: 8px;"></span> <strong>Ribbons</strong> = connections showing how often two hate categories appear together</p>
  <p><span style="display: inline-block; width: 20px; height: 20px; background: #b07bea; border-radius: 50%; vertical-align: middle; margin-right: 8px;"></span> <strong>Arcs</strong> = individual hate categories around the circle</p>
  <p><strong>Thicker ribbons = more frequent intersections.</strong> Hover over any arc to highlight all its connections.</p>
  <p>This chart reveals that online hate rarely targets just one identity—it's deeply interconnected.</p>
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

  const orderedSteps = ["grayscale", "intro", "explainer", "sexist", "political", "full", "end"];
  
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

      if (progress < 0.14) {        // ~1/7
          currentStep.set("grayscale");
        } else if (progress < 0.28) {  // ~2/7
          currentStep.set("intro");
        } else if (progress < 0.42) {  // ~3/7
          currentStep.set("explainer");
        } else if (progress < 0.57) {  // ~4/7
          currentStep.set("sexist");
        } else if (progress < 0.71) {  // ~5/7
          currentStep.set("political");
        } else if (progress < 0.85) {  // ~6/7
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
      <p>By Harikrishnan P"</p>
      <p>Kimberlé Crenshaw coined the term <em>intersectionality</em> in 1989: systems of oppression interlock, creating unique experiences for people living at those junctures. 
        In India, where caste, religion, gender, class, and region layer over one another in complex patterns, intersectionality plays out in everyday experience. It’s a way of understanding how people navigate those tangled pressures.</p>
    </div>
  </div>

  <!-- ARTICLE: Starts immediately after scrolly -->
  <Article>

<p>Dalit feminists elaborated on Ambedkar's program by interrogating how caste endures through the policing and sexual exploitation of women.
  Mainstream Indian feminism, in turn, was more invested in upper-caste concerns, bracketing the axes of caste and religion that determine the modalities of violence. 
  The Dalit movement, on the other hand, often relegated women's experiences to the subsidiary position of anti-caste struggle.</p>

<p>In contrast, Dalit women, Muslim women, transgender individuals, and disabled people—anyone facing multiple oppressions—recognize the inseparability of these systems.
<u>For instance, a Dalit woman who faces sexual assault-casteist and sexist at once.</u> 
<u>A Muslim transgender person who is harassed online, confronts queerphobia, Islamophobia, and misogyny all at once.</u></p>

<div class="callout-box">
<p><strong>Shhor does not treat hate as a isolated phenomenon.</strong> 
Each comment is annotated for all identities it targets, and analyses seek patterns where multiple oppressions converge.  
It is to abandon those with multiple marginalized identities—the very individuals most in need of protection—when one supposes that oppression manifests in a single form.  
This position is corroborated both by the empirical data and by the lived experiences of people. Thus, intersectionality is needed for true liberation.
</p>
</div>

<h2>Most Hate Isn't Single-Issue</h2>

<p>Of those comments crossing identities, 
<span class="stat-highlight"><strong>85% include at least two types of hate, and around 15% include three or more, which suggests that, in general, online hate speech often targets more than one aspect of a target's identity at a time.</strong></span>
These numbers show that most online hate speech doesn't just go after one identity.
 It attacks multiple parts of who someone is, all at the same time.</p>

    <figure class="article-image">
      <img src="./assets/donut.png" alt="Donut Chart: The Entanglement of Hate" />
    </figure>

<p>The chord diagram below visualizes the relationships among different kinds of hate, where thicker ribbons indicate more frequent co-occurrences. This figure highlights how online hate is convoluted, interrelated, and often multi-identity in the targets.</p>

<p><em>This visualization's goal is to show how Online hate is not as simple as some people make it out to be—it's messy, entangled, and targets multiple identities at once.</em> 
</p>


<p>An UpSet plot provides a more formal delineation of the principal intersections. Reading left to right, the left-hand bar chart represents the prevalence of each hate category, the connected dots indicate co-occurring categories, and the top bar represents the frequency of each specific combination. Though the complete diagram is dense, the salient pattern is readily apparent: the most common intersections all sit within the top ten combinations, while all but one three-category intersection—political-communal-sexist—comprise no more than two categories, and there are numerous additional types of intersections beyond these core patterns.</p>

<p>The adjacent bar chart shows that comments with three or more intersections are far more diverse in terms of category combination. Two-category intersections correspond to more predictable patterns, while three-or-more-category attacks create significantly more variation, which suggests that the greater the multiplicity of targeted identities, the more both severity and unpredictability increase.
</p>

<figure class="article-image">
      <img src="./assets/upset.png" alt="Intersection Complexity Increases with Multiple Categories" />
    </figure>

<h3> Statistical Associations between Types of Hate </h3>

<figure class="article-image">
      <img src="./assets/heatmap.png" alt="Category Association Strength (Phi Coefficient)" />
    </figure>

<p>A heat map displays the associations between hate categories quantified by the phi coefficient, φ, which runs in the interval between -1 and +1. Positive values denote frequent co-occurrence in the same comments; negative values denote rare co-occurrence, and values near zero indicate relative independence.</p>

<p>The heat map reveals critical patterns about how different forms of hate intersect—and when they don't. <strong>The strongest positive association appears between casteist and racist hate (φ = 0.216)</strong>, suggesting that comments attacking someone's caste often simultaneously deploy racial or xenophobic slurs, particularly against Adivasi communities. This reflects how caste hierarchies and racial discrimination are deeply intertwined in Indian contexts, where upper-caste supremacy often manifests through both casteist and racist language.</p>

<h2>Constructing the Dataset</h2>

<p>Shhor's dataset includes <strong>48,000 comments</strong> which were scraped from Indian social media between <strong>October 2022 and November 2025</strong>. The dataset focuses on public discourses that shape culture and normalize violence. The data span multiple platforms and the language in focus was Hinglish, capturing tones ranging from humorous derision to explicit threats.</p>

<p>The researchers reimagined, collected, and transformed abusive content targeting activists and artists into analyzable data. In an Instagram post, Aindriya Barua (Founder & CEO of ShhorAI) invited others to share links to the targeted posts, while they developed a scraper to automate the collection of hate comments.</p>

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

<p>As most comments contained the presence of more than one hatred, each comment could receive multiple labels. For instance, a comment using communal, political, and sexist slurs to refer to a Muslim woman politician would be labeled as containing communal hate, political hate, and sexist hate.</p>

<h3>Annotation Process</h3>

<p>Aindriya faced difficulty manually screened thousands of comments to determine hate content and categorize them.</p>

<p>To handle the workload, they recruited about <strong>45 volunteers</strong> from marginalised backgrounds with lived experience, forming a collaborative team guided by standardized procedures in pursuit of <strong>A SAFER INTERNET FOR ALL</strong> </p>

<h3>Annotation Considerations</h3>

<div class="callout-box">
<p><strong>Who annotates determines what gets labeled.</strong> Annotators' identities impact labeling: upper-caste evaluators may overlook casteist microaggressions, and male annotators may not notice subtle misogyny. Their annotation team consisted of individuals from marginalized backgrounds, trained to detect overt and implicit forms of hate.</p>
</div>

<p>The guidelines adapted to the Indian contexts included :</p>

<ul>
    <li>Explicit slurs and violent language</li>
    <li>Coded language and dog whistles ("Sulli," "Bulla," "reservation quota")</li>
    <li>Dehumanizing comparisons</li>
    <li>Incitement to violence or boycott</li>
    <li>Sexualized abuse and rape threats</li>
    <li>Mockery and dismissal of marginalized identities</li>
</ul>

<p>Till now, Shhor has accumulated <strong>India's most extensive Hinglish real-world dataset of 48,000+ comments</strong> and used it in first-of-its-kind research. This dataset supported the training of an advanced AI model. Recognition of work at Aindriya was widespread.</p>

<h2>Math and Methodology</h2>

<h3>Context</h3>

<ol>
    <li>The general hate category was omitted to focus on specific identity-based hate.</li>
    <li>Only those comments labeled as hate and having at least one intersection were included; comments with no intersections were excluded from this analysis.</li>
</ol>


<p>Calculation:</p>

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

<p>These φ values across all category pairs are visualized in the heat map, with color intensity showing the strength of association. Darker colors reflect stronger co-occurrence, hence showing which forms of hate most frequently combine in forming intersectional attacks.</p>

<h2>Why This Data Exists: The Significance</h2>

<p>Most of the studies done on hate speech in India have focused on single categories; there is even less research on the intersections of certain categories and the work done using datasets specifically created with and for the communities most affected. </p>

<div class="callout-box">
<p>As Aindriya, Shhor's founder, states: <em>"Shhor AI's dataset exists because the need was urgent. Big-tech platforms fail marginalized communities. The state criminalizes their speech while ignoring hate targeting them."</em></p>
</div>

<p><strong>The data serve as empirical evidence both to counter reclamations that downplay the severity of online hate and to document the pervasiveness and measurable impact of violence online.</strong> </p>

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
    height: 700vh;
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
