<script lang="ts">
  import { GoButtonStatus } from '@/model'

  import { createEventDispatcher } from 'svelte'

  export let size = {
    width: '10rem',
    height: '10rem'
  }
  export let radius = '0.5rem'
  export let id = ''
  export let status: GoButtonStatus = GoButtonStatus.Normal
  export let disabled = false

  const dispatch = createEventDispatcher()

  let clicking = false

  const clicked = () => {
    dispatch('click', {})
  }

  let pos = {
    x: 0,
    y: 8
  }

  const moved = (e: MouseEvent) => {
    if (disabled) return
    const target = (e.currentTarget as HTMLElement).getBoundingClientRect()
    pos.x = e.x - target.x
    pos.y = e.y - target.y
    e.preventDefault()
    e.stopPropagation()
  }
</script>

<button
  class="effect-button {status}"
  class:clicking
  on:mousemove={moved}
  on:mousedown={() => (clicking = true)}
  on:mouseup={() => (clicking = false)}
  on:click={clicked}
  style="width: {size.width}; height: {size.height}; border-radius: {radius}"
  {id}
>
  <span class="content">
    <slot><span class="has-text-white-ter title is-3">Go -></span></slot>
  </span>
  <span class="effect-layer" style="left: {pos.x}px; top: {pos.y}px" />
</button>

<style>
  .effect-button {
    box-shadow: 0 0.5em 1em -0.125em rgba(10, 10, 10, 0.2);
    overflow: hidden;
    border: none;
    position: relative;
    transition: background-color 0.3s ease;
    background-color: #007bfc;
  }

  .normal {
    cursor: pointer;
  }

  .loading {
    cursor: wait;
  }

  .disabled {
    cursor: not-allowed;
  }

  .effect-layer {
    z-index: 5;
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 0;
    height: 0;
    background: radial-gradient(circle closest-side, #51b9ff, transparent);
    transform: translate(-50%, -50%);
    transition: width 0.2s ease, height 0.2s ease;
  }
  .content {
    position: relative;
    z-index: 6;
  }

  .effect-button:hover .effect-layer {
    width: 300px;
    height: 300px;
  }

  .clicking .effect-layer {
    width: 200px !important;
    height: 200px !important;
  }

  .clicking .effect-layer {
    background: radial-gradient(circle closest-side, #5eccff, transparent);
  }
</style>
