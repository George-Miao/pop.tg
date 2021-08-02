<script lang="ts">
  import { onMount } from 'svelte'

  export let disabled = false
  export let value: string
  let ref: HTMLElement
  onMount(() => {
    ref.focus()
  })
</script>

<input
  class="level-item text-input"
  type="text"
  placeholder="Your LONG url"
  bind:value
  bind:this={ref}
  {disabled}
/>

<style>
  .text-input {
    max-width: 100%;
    width: 100%;
    height: 2.5rem;
    justify-content: flex-start;
    line-height: 1.5;
    padding: 1.7rem;
    margin: 2rem;
    position: relative;
    box-shadow: inset 0 0 4px 0 rgba(0, 0, 0, 0.1);
    transition: all 0.1s ease;
    border-radius: 5px;
    cursor: pointer;
  }

  .text-input:disabled {
    background-color: rgba(224, 224, 224, 0.15);
    color: rgba(0, 0, 0, 0.5);
  }

  .text-input::before {
    content: ' ';
    position: absolute;
    top: 0;
    bottom: 0;
    left: -3px;
    width: 3px;
    height: 100%;
    color: black;
  }

  .text-input:hover,
  .text-input:focus {
    box-shadow: inset 0 0 4px 0 rgba(0, 0, 0, 0.2);
  }

  .text-input:focus {
    cursor: text;
  }
</style>
