<script lang="ts">
  import { onMount } from 'svelte'
  import { createEventDispatcher } from 'svelte'

  const dispatchEvent = createEventDispatcher()

  export let url: string
  export let key: string
  export let disabled: boolean = false

  let ref: HTMLElement

  onMount(() => {
    ref.focus()
  })

  const onInput = () => {
    dispatchEvent('input')
  }

  const onKeypress = (e: any) => {
    const event = e as KeyboardEvent
    if (event.key === 'Enter') dispatchEvent('enter')
  }
</script>

<div class="input-container">
  <div class="text-input">
    <input
      type="text"
      placeholder="Your long URL"
      bind:value={url}
      bind:this={ref}
      on:input={onInput}
      on:keydown={onKeypress}
      {disabled}
    />
  </div>
  <div class="text-input">
    <span class="label noselect">Pop.tg/</span>
    <input
      type="text"
      placeholder="key"
      class="padded"
      bind:value={key}
      on:input={onInput}
      on:keydown={onKeypress}
      {disabled}
    />
  </div>
</div>

<style>
  .input-container {
    width: 100%;
    height: 7rem;
    box-shadow: 0px 8px 20px rgb(0 0 0 / 6%);
    border-radius: 5px;
    background-color: white;
  }
  .text-input {
    width: 100%;
    height: 3.5rem;
    justify-content: flex-start;
    transition: all 0.1s ease;
    position: relative;
    display: flex;
    padding-left: 1.7rem;
  }

  .label {
    height: 100%;
    padding-left: 0.4rem;
    line-height: 3.5rem;
    margin-right: 1rem;
    color: rgba(0, 0, 0, 0.5);
  }

  .text-input input {
    font-size: 1.1rem;
    flex-grow: 1;
    height: 100%;
    cursor: pointer;
    background-color: unset;
    color: #3d3d3d;
  }

  .text-input:disabled {
    background-color: rgba(224, 224, 224, 0.15);
    color: rgba(0, 0, 0, 0.5);
  }

  .text-input:first-child {
    border: solid 1px rgb(235, 234, 234);
    border-top-left-radius: 5px;
  }

  .text-input:first-child:hover {
    box-shadow: 0px 2px 14px rgb(0 0 0 / 6%);
  }

  .text-input:last-child {
    border-bottom-left-radius: 5px;
    border: solid 1px rgb(235, 234, 234);
    border-top: unset;
  }

  .text-input:last-child:hover {
    box-shadow: 0px -2px 14px rgb(0 0 0 / 6%);
  }
  .text-input input:focus {
    cursor: text;
  }
</style>
