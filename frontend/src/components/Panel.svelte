<script lang="ts">
  import { fade } from 'svelte/transition'
  import { writable } from 'svelte/store'
  import { setContext, tick } from 'svelte'

  import { genToken } from '@back/utils'
  import History from './History.svelte'
  import HoverButton from './HoverButton.svelte'
  import Input from './Input.svelte'
  import { bulkQuery, newRecord } from '../api'
  import { GoButtonStatus } from '../model'
  import type { Callback } from '../model'
  import {
    isValidToken,
    isValidUrl,
    loadHistories,
    loadJson,
    saveHistories
  } from '../util'

  import { saveAs } from 'file-saver'

  let storedFocusCallback: undefined | Callback = undefined

  const add = writable('')

  setContext('newRecord', add)

  let url = 'https://'
  let key = genToken(5)

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

  let buttonStatus = GoButtonStatus.Normal

  let histories = loadHistories()

  const validate = () => {
    if (!isValidUrl(url)) {
      alert('Invalid url')
      return false
    }
    if (!isValidToken(key)) {
      alert('Invalid token: 5 - 12 chars (a-z, A-Z and 0-9)')
      return false
    }
    return true
  }

  const handleGo = () => {
    if (buttonStatus === GoButtonStatus.Loading) return
    if (!validate()) return

    buttonStatus = GoButtonStatus.Loading

    const request = {
      key,
      value: url
    }

    newRecord(request)
      .then(resp => {
        if (resp.success && resp.content.body) {
          const body = resp.content.body
          const obj = {
            key: body.key,
            token: body.token,
            oldUrl: body.value,
            newUrl: `https://pop.tg/${body.key}`,
            focusedCallback
          }
          if (histories.length > 0) histories = [obj, ...histories]
          else histories = [obj]
          saveHistories(histories)
          buttonStatus = GoButtonStatus.Disabled
          tick().then(() => add.set(body.key))
        } else {
          buttonStatus = GoButtonStatus.Disabled
          alert(`[${resp.status}] ${resp.status_text}`)
        }
      })
      .catch(e => {
        buttonStatus = GoButtonStatus.Disabled
        alert(e)
        console.error(e)
      })
    url = 'https://'
    key = genToken(5)
  }

  const deleteThis = (e: CustomEvent<{ key: string }>) => {
    histories = histories.filter(v => v.key !== e.detail.key)
    saveHistories(histories)
  }

  const handleAlert = (e: CustomEvent<string>) => {
    alert(e.detail)
  }

  const handleInput = () => {
    if (isValidUrl(url) && isValidToken(key)) {
      buttonStatus = GoButtonStatus.Normal
    } else {
      buttonStatus = GoButtonStatus.Disabled
    }
  }

  const dump = () => {
    if (histories.length === 0) {
      alert('Create or import some records first!')
      return
    }
    const data = new Blob([JSON.stringify(histories)], {
      type: 'application/json;charset=utf-8'
    })
    saveAs(data, 'url_dumps.json')
  }

  const load = async () => {
    const loaded = await loadJson().catch((e: Error) => alert(e.message))
    if (!loaded) return
    const keys = histories.map(e => e.key)
    const newHistory = loaded.filter(x => !keys.includes(x.key))
    await bulkQuery(
      newHistory.map(e => {
        return {
          key: e.key,
          value: e.oldUrl,
          token: e.token
        }
      })
    )
      .then(data => {
        console.log('loading')
        const records = data.content.body
        if (!data.success || !records) alert('Failed to verify your data')
        else {
          console.log(records)
          histories.push(
            ...newHistory.filter(e => records.matched.includes(e.key))
          )
          if (records.unmatched.length > 0) {
            alert("Some of your record is invalid, they're not added")
          }
          histories = histories
          saveHistories(histories)
          console.log('done')
        }
      })
      .catch(e => alert(e.message))
  }
</script>

<div class="outter" on:mousedown|self={clearFocusCallback}>
  <div class="panel">
    <Input
      bind:url
      bind:key
      on:enter={handleGo}
      on:input={handleInput}
      disabled={buttonStatus === GoButtonStatus.Loading}
    />

    <HoverButton
      status={buttonStatus}
      radius={buttonRadius + 'rem'}
      size={{
        height: buttonRadius * 2 + 'rem',
        width: buttonRadius * 2 + 'rem'
      }}
      id="big-button"
      on:click={handleGo}
    >
      {#if buttonStatus === GoButtonStatus.Loading}
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
  {#if histories.length !== 0}
    <div class="histories" class:dodging={alerting}>
      {#each histories as history (history.key)}
        <History
          prop={history}
          {focusedCallback}
          on:delete={deleteThis}
          on:alert={handleAlert}
        />
      {/each}
    </div>
  {/if}
  <div class="btns">
    <button
      class="load"
      on:click={load}
      class:disable={buttonStatus === GoButtonStatus.Loading}
      disabled={buttonStatus === GoButtonStatus.Loading}>Import</button
    >
    <button
      class="dump"
      on:click={dump}
      class:disable={buttonStatus === GoButtonStatus.Loading}
      disabled={buttonStatus === GoButtonStatus.Loading}>Dump</button
    >
  </div>
</div>

<style>
  .btns {
    margin: 2rem;
  }
  .btns button {
    position: relative;
    transition: background 0.3s ease, box-shadow 0.3s ease;
    height: 2.5rem;
    margin-bottom: unset;
    margin-top: 0.4rem;
    width: 8rem;
    animation: in 0.3s;
    border: none;
    background: rgb(240, 240, 240);
    cursor: pointer;
    color: rgba(22, 22, 22);
  }

  .btns button::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
    width: 100%;
    height: 100%;
    opacity: 0;
    border-radius: 1.25rem;
    box-shadow: 0 0 2px 0 rgba(0, 0, 0, 0.2);
  }

  .btns button:first-child {
    border-radius: 1.25rem 0 0 1.25rem;
  }

  .btns button:first-child::after {
    border-radius: 1.25rem 0 0 1.25rem;
  }

  .btns button:last-child {
    border-radius: 0 1.25rem 1.25rem 0;
  }

  .btns button:last-child::after {
    border-radius: 0 1.25rem 1.25rem 0;
  }

  .btns button:hover {
    background: rgb(252, 252, 252);
  }

  .btns button:hover::after {
    opacity: 1;
  }

  .btns button.disable {
    cursor: not-allowed;
  }

  .btns button.disable::after:hover {
    opacity: 0;
  }

  .btns button.disable:hover {
    background: rgb(240, 240, 240);
  }

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
    max-width: 35rem;
    display: flex;
    justify-content: center;
    margin-bottom: 2rem;
    flex-direction: column;
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
    color: var(--red);
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
    margin-bottom: 0;
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
    position: absolute;
    right: -3rem;
    z-index: 10;
    margin: unset;
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
    display: inline-block;
    color: rgba(255, 255, 255, 0.98);
    font-size: 4rem;
    animation: spin 0.7s infinite;
  }

  @media only screen and (max-width: 700px) {
    .panel {
      width: min(max(40%, 24rem), 80%);
    }

    .histories {
      padding: 0;
    }

    :global(#big-button) {
      position: relative;
      box-shadow: 0px 4px 30px rgb(0 0 0 / 26%);
      margin-top: 1rem;
      height: 6rem;
      border-radius: 5px;
      width: unset !important;
      height: unset !important;
      border-radius: 5px !important;
      right: unset;
    }
    :global(#big-button .content svg) {
      transform: scale(0.7);
    }
  }
</style>
