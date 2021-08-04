<script lang="ts">
  import Panel from './components/Panel.svelte'
  import { GithubOne, SendEmail, PeopleTopCard } from '@icon-park/svg'

  const svgInit = { size: '2rem', fill: '#4c4c4c' }
</script>

<div class="links">
  <a class="icon" href="https://github.com/George-Miao/pop.tg"
    >{@html GithubOne(svgInit)}</a
  >
  <a class="icon" href="mailto:gm@miao.dev">{@html SendEmail(svgInit)}</a>
  <a class="icon" href="https://miao.dev">{@html PeopleTopCard(svgInit)}</a>
</div>
<Panel />

<style>
  :global(:root) {
    --red: rgba(255, 95, 89, 0.8);
    --green: rgb(46, 204, 64, 0.8);
    --blue: #007bfc;
  }
  :global(*),
  :global(::after),
  :global(::before) {
    box-sizing: inherit;
    font-family: 'Atkinson Hyperlegible', sans-serif;
  }

  :global(html) {
    background-color: rgb(246, 246, 246);
    color: rgba(10, 10, 10, 0.95);
    font-size: 16px;
    font-family: 'Atkinson Hyperlegible', sans-serif;
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
    min-width: 300px;
    overflow-x: hidden;
    overflow-y: scroll;
    text-rendering: optimizeLegibility;
    -webkit-text-size-adjust: 100%;
    -moz-text-size-adjust: 100%;
    text-size-adjust: 100%;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    font-size: 1em;
    font-weight: 400;
    line-height: 1.5;
  }

  :global(input) {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    outline: none;
    border: none;
    margin: 0;
    border: 0;
    color: rgba(10, 10, 10, 0.95);
  }

  :global(.iconfont) {
    font-family: 'iconfont' !important;
    font-size: 16px;
    font-style: normal;
    -webkit-font-smoothing: antialiased;
    -webkit-text-stroke-width: 0.2px;
    -moz-osx-font-smoothing: grayscale;
  }

  :global(.box) {
    background-color: #fff;
    border-radius: 6px;
    box-shadow: 0 0.5em 1em -0.125em rgb(10 10 10 / 10%),
      0 0 0 1px rgb(10 10 10 / 2%);
    color: #4a4a4a;
    display: block;
    padding: 1.25rem;
  }

  :global(.noselect) {
    -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
    -khtml-user-select: none; /* Konqueror HTML */
    -moz-user-select: none; /* Old versions of Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
    user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome, Edge, Opera and Firefox */
  }

  .links {
    position: fixed;
    left: 0;
    bottom: 0;
    padding: 1rem;
    line-height: normal;
    display: flex;
    flex-direction: column;
    z-index: 5000;
  }

  .links a {
    margin-top: 1rem;
    cursor: pointer;
    display: block;
  }
</style>
