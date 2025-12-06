<div class="article">
  <slot></slot>
</div>

<style>
  .article {
    max-width: 1060px;
    margin: 0 auto;
    padding: 1rem 1.5rem;
    line-height: 1.4;
    font-size: 1.15rem;
    justify-content: center;
    align-items: center;
    text-align: justify;
    text-justify: inter-word;
  }

  /* Replace the existing .article-image styles in App.css */

:global(.article-image) {
  width: 100%;
  max-width: 1060px;
  margin: 2rem auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

:global(.article-image img) {
  width: 100%;
  height: auto;
  display: block;
}

/* Alternative: If you want images to break out of container */
:global(.article-image.breakout) {
  width: 100vw;
  max-width: none;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  display: flex;
  justify-content: center;
}

:global(.article-image.breakout img) {
  width: auto;
  max-width: 95vw;
  height: auto;
}
</style>
