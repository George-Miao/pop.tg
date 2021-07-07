<script lang="ts">
  import Panel from './components/Panel.svelte'
</script>

<Panel />

<style>
  :global(:root) {
    --red: rgba(250, 65, 59, 0.8);
    --green: rgb(46, 204, 64, 0.8);
    --blue: rgb(55, 151, 255, 0.8);
  }
  :global(*),
  :global(::after),
  :global(::before) {
    box-sizing: inherit;
  }

  :global(html) {
    background-color: rgb(250, 250, 250);
    color: rgba(10, 10, 10, 0.95);
    font-size: 16px;
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

  :global(.panel) {
    border-radius: 6px;
    box-shadow: 0 0.5em 1em -0.125em rgb(10 10 10 / 10%),
      0 0 0 1px rgb(10 10 10 / 2%);
    font-size: 1rem;
    background-color: #fff;
  }

  :global(box) {
    background-color: #fff;
    border-radius: 6px;
    box-shadow: 0 0.5em 1em -0.125em rgb(10 10 10 / 10%),
      0 0 0 1px rgb(10 10 10 / 2%);
    color: #4a4a4a;
    display: block;
    padding: 1.25rem;
  }
</style>
