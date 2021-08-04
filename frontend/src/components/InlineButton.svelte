<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  export let icon: string = ''
  export let hoverColor: string = ''
  export let hidden: boolean = false

  const dispatcher = createEventDispatcher()
  const onClick = () => dispatcher('click')
</script>

<button
  class="inline-button"
  on:click|stopPropagation={onClick}
  class:hidden
  style="--hover-color: {hoverColor}"
>
  <i class="iconfont">{icon}</i>
</button>

<style>
  .inline-button {
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 100;
    cursor: pointer;
    text-align: center;
    white-space: nowrap;
    background-color: unset;
    border: unset;
    border-radius: unset;
    margin: unset;
    transition: all 0.2s cubic-bezier(0.31, 0.4, 0.36, 1);
  }
  .inline-button:hover {
    background-color: var(--hover-color);
  }
  .inline-button.hidden {
    opacity: 0;
  }
  .inline-button i {
    color: rgba(63, 63, 63, 0.801);
    transition: all 0.1s cubic-bezier(0.31, 0.4, 0.36, 1);
  }

  .inline-button:hover i {
    color: white !important;
  }
</style>
