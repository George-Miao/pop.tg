<script lang="ts">
  import { fade } from 'svelte/transition'
  import History from './History.svelte'
  import HoverButton from './HoverButton.svelte'
  import Input from './Input.svelte'
  import { newRecord } from '../api'
  import type { Callback, HistoryProp } from '../model'
  import { isValidUrl } from '../util'
  import { genToken } from '@back/utils'

  let storedFocusCallback: undefined | Callback = undefined

  let url = 'https://'

  let loading = false

  const buttonRadius = 4.5

  const focusedCallback = (cb: Callback) => {
    storedFocusCallback?.()
    storedFocusCallback = cb
  }

  const clearFocusCallback = (e: MouseEvent) => {
    storedFocusCallback?.()
    storedFocusCallback = undefined
  }

  let alerting = false
  let alertMsg = ''
  let alertTimeout: number | null

  const alert = (message: string) => {
    if (alertTimeout) {
      clearTimeout(alertTimeout)
      alertTimeout = null
    }
    alerting = true
    alertMsg = message
    alertTimeout = setTimeout(() => {
      alerting = false
      alertMsg = ''
    }, 3000)
  }

  let histories: HistoryProp[] = [
    {
      key: 'abc',
      newUrl: 'https://pop.tg/abc',
      oldUrl: 'https://youtube.com',
      token: 'aiusdhiauhwduiahd',
      ttl: 300,
      focusedCallback
    },
    {
      key: 'abd',
      newUrl: 'https://pop.tg/abd',
      oldUrl:
        'https://youtube.com/asoduhauifghauiopfhuioahduiopqahdauio;dhuiopafhuopawghduoahop;dh9uiopdh',
      token: 'aiusdhiauhwduiahd',
      focusedCallback
    }
  ]

  const handleGo = (e: CustomEvent) => {
    if (loading) return
    if (!url.startsWith('http')) {
      alert('Invalid url: Should start with http or https')
      return
    }
    if (!isValidUrl(url)) {
      alert('Invalid url')
      return
    }
    const key = genToken(6)
    const obj = {
      key,
      newUrl: `https://pop.tg/${key}`,
      oldUrl: url,
      focusedCallback,
      token: genToken()
    }
    url = ''
    loading = true
    setTimeout(() => {
      histories = [obj, ...histories]
      console.log(obj)
      loading = false
    }, 3000 * Math.random() + 1000)
  }

  const deleteThis = (e: CustomEvent<{ key: string }>) => {
    histories = histories.filter(v => v.key !== e.detail.key)
  }

  const handleAlert = (e: CustomEvent<string>) => {
    alert(e.detail)
  }
</script>

<div class="outter" on:mousedown|self={clearFocusCallback}>
  <div class="box panel">
    <Input bind:value={url} />
    <HoverButton
      radius={buttonRadius + 'rem'}
      size={{
        height: buttonRadius * 2 + 'rem',
        width: buttonRadius * 2 + 'rem'
      }}
      disabled={loading}
      id="big-button"
      on:click={handleGo}
    >
      {#if loading}
        <i class="iconfont load-icon">&#xe646;</i>
      {:else}
        <svg
          width="40"
          height="60"
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
          in:fade
        >
          <polyline
            points="12 5 37 30 12 55"
            stroke="rgba(255,255,255,0.98)"
            stroke-width="4"
            stroke-linecap="butt"
            fill="none"
            stroke-linejoin="round"
          />
        </svg>{/if}</HoverButton
    >
  </div>
  {#if alerting}
    <div class="alerts" transition:fade>{alertMsg}</div>
  {/if}
  <div class="histories" class:dodging={alerting}>
    {#each histories as history}
      <History prop={history} on:delete={deleteThis} on:alert={handleAlert} />
    {/each}
  </div>
</div>

<style>
  .outter {
    display: flex;
    align-items: center;
    flex-direction: column;
    position: relative;
    padding-top: min(max(2rem, 15vw), 20vh);
    min-height: 100vh;
  }

  .panel {
    position: relative;
    width: min(max(40%, 32rem), 90%);
    height: 14rem;
    display: flex;
    justify-content: center;
    margin-bottom: 2rem;
  }

  .alerts {
    position: relative;
    /* opacity: 0; */
    width: min(max(40%, 32rem), 80%);
    margin: 1rem 0;
    display: flex;
    padding: 0 1.5rem;
    align-items: center;
    height: 4rem;
    box-shadow: 0 0 2px 0 #fca5a8;
    border-radius: 3px;
    color: #fd464f;
    font-weight: 700;
    background-color: #fbeded;
  }

  .alerting {
    top: 0;
    opacity: 1;
    animation: alertIn 0.5s;
  }

  .histories {
    margin: 1rem;
    position: relative;
    width: min(max(40%, 32rem), 90%);
    padding: 1rem;
    position: relative;
  }

  @keyframes alertIn {
    from {
      opacity: 0;
    }
    to {
      top: 0;
      opacity: 100;
    }
  }

  @keyframes alertOut {
    from {
      top: 0;
      opacity: 0;
    }
    to {
      opacity: 100;
    }
  }

  :global(#big-button) {
    position: absolute !important;
    bottom: -2rem;
    right: -2rem;
    z-index: 10;
  }

  @keyframes spin {
    from {
      transform: rotate(0turn);
    }
    to {
      transform: rotate(1turn);
    }
  }

  .load-icon {
    display: block;
    color: rgba(255, 255, 255, 0.98);
    font-size: 4rem;
    animation: spin 0.7s infinite;
  }

  @media only screen and (max-width: 700px) {
    .panel {
      flex-wrap: wrap;
    }

    .histories {
      padding: 0;
    }

    :global(#big-button) {
      bottom: -2rem;
      right: -1rem;
    }
  }
</style>
