<script lang="ts">
  import { Check, Close } from '@icon-park/svg'
  import { createEventDispatcher, getContext } from 'svelte'
  import type { Writable } from 'svelte/store'
  import { slide } from 'svelte/transition'

  import v2api from '@/v2api'
  import { copy, isValidUrl, sleep } from '@/util'
  import type { Callback, HistoryStored } from '@/model'
  import { HistoryStatus, ManageEvent } from '@/model'

  import InlineButton from './InlineButton.svelte'

  export let prop: HistoryStored
  export let focusedCallback: (cb: Callback) => void

  let focused = false
  let status = HistoryStatus.Normal
  let newValue: string = ''

  let add: Writable<string> = getContext('newRecord')

  add.subscribe(e => {
    if (e === prop.key) {
      focusedCallback(restoreStatus)
      focused = true
    }
  })

  const eventDispatcher = createEventDispatcher()

  const doneSvg = Check({ size: '1.5rem', theme: 'outline', fill: 'white' })
  const errorSvg = Close({ size: '1.5rem', theme: 'outline', fill: 'white' })

  let doneMsg: string | null = null
  let errorMsg: string | null = null

  const cleanMsg = () => {
    doneMsg = null
    errorMsg = null
  }

  const error = async (msg: string) => {
    cleanMsg()
    errorMsg = msg
    status = HistoryStatus.Error
    await sleep(2000)
    if (!errorMsg || errorMsg !== msg) return
    status = HistoryStatus.Normal
    errorMsg = null
  }

  const done = async (msg: string) => {
    cleanMsg()
    doneMsg = msg
    status = HistoryStatus.Done
    await sleep(2000)
    if (!doneMsg || doneMsg !== msg) return
    status = HistoryStatus.Normal
    doneMsg = null
  }

  const manage = (type: ManageEvent) => (e: CustomEvent) => {
    if (!focused) {
      historyClicked()
      return
    }
    e.stopPropagation()

    switch (type) {
      case ManageEvent.Remove: {
        // Enter remove status - show confirm and cancel button
        status = HistoryStatus.Removing
        break
      }
      case ManageEvent.RemoveCancel: {
        status = HistoryStatus.Normal
        break
      }
      case ManageEvent.RemoveConfirm: {
        status = HistoryStatus.Loading
        // Try remove
        v2api
          .deleteRecord(prop.key, prop.token)
          .then(e => {
            if (!e.ok) {
              error(`Error deleting: [${e.error_code}] ${e.error_text}`)
            } else {
              done(`Done deleting ${prop.key}`).then(() =>
                eventDispatcher('delete', {
                  key: prop.key
                })
              )
            }
          })
          .catch(e => {
            error(`${e}`)
          })
        break
      }
      case ManageEvent.Edit: {
        // Enter edit status - show input and correspond buttons
        status = HistoryStatus.Editing
        newValue = prop.oldUrl
        break
      }
      case ManageEvent.EditCancel: {
        status = HistoryStatus.Normal
        newValue = ''
        break
      }
      case ManageEvent.EditConfirm: {
        // Finish editing
        if (!isValidUrl(newValue)) {
          eventDispatcher('alert', 'Invalid url')
          status = HistoryStatus.Normal
          return
        }
        status = HistoryStatus.Loading
        v2api
          .updateRecord(prop.key, newValue, prop.token, prop.ttl)
          .then(async e => {
            if (!e.ok) {
              error(`[${e.error_code}] ${e.error_text}`)
            } else {
              const body = e.result
              await done(`Updated`).then(() => {
                prop.oldUrl = newValue
                prop.token = body.token
              })
              eventDispatcher('update')
            }
          })
          .catch(e => {
            error(e)
          })
          .finally(() => {
            newValue = ''
          })

        break
      }
      case ManageEvent.Copy: {
        copy(prop.newUrl).then(() => done('Copied'))
      }
    }
  }

  const restoreStatus = () => {
    cleanMsg()
    status = HistoryStatus.Normal
    focused = false
  }

  const historyClicked = () => {
    if (focused) {
      if (status === HistoryStatus.Normal) {
        window.open(prop.newUrl)
      }
    } else {
      focusedCallback(restoreStatus)
      focused = true
    }
  }
</script>

<div class="history" on:click={historyClicked} class:focused in:slide>
  <div
    class="normal history-inner"
    class:hidden={status !== HistoryStatus.Normal}
  >
    <InlineButton
      on:click={manage(ManageEvent.Remove)}
      hidden={!focused}
      icon="&#xe6b0;"
      hoverColor="rgba(250, 65, 59, 0.8)"
    />
    <InlineButton
      on:click={manage(ManageEvent.Edit)}
      hidden={!focused}
      icon="&#xe604;"
      hoverColor="rgba(44, 134, 252, 0.8)"
    />
    <InlineButton
      on:click={manage(ManageEvent.Copy)}
      hidden={!focused}
      icon="&#xe685;"
      hoverColor="rgba(44, 134, 252, 0.8)"
    />
    <div class="urls left">
      <p class="old noselect">{prop.oldUrl}</p>
      <p class="new noselect">{prop.newUrl}</p>
    </div>
  </div>
  <div
    class="confirm-remove history-inner"
    class:hidden={status !== HistoryStatus.Removing}
  >
    <div class="left noselect">
      <span>Confirm delete?</span>
    </div>
    <InlineButton
      on:click={manage(ManageEvent.RemoveConfirm)}
      hidden={!focused}
      icon="&#xe80f;"
      hoverColor="rgba(250, 65, 59, 0.8)"
    />
    <InlineButton
      on:click={manage(ManageEvent.RemoveCancel)}
      hidden={!focused}
      icon="&#xe624;"
      hoverColor="rgba(44, 134, 252, 0.8)"
    />
  </div>
  <div
    class="edit-input history-inner"
    class:hidden={status !== HistoryStatus.Editing}
  >
    <input
      type="text"
      bind:value={newValue}
      class="new-url left"
      on:click|stopPropagation
    />

    <InlineButton
      on:click={manage(ManageEvent.EditConfirm)}
      icon="&#xe80f;"
      hoverColor="rgba(250, 65, 59, 0.8)"
    />
    <InlineButton
      on:click={manage(ManageEvent.EditCancel)}
      icon="&#xe624;"
      hoverColor="rgba(44, 134, 252, 0.8)"
    />
  </div>
  <div
    class="done history-inner status"
    class:hidden={status !== HistoryStatus.Done}
  >
    <div class="indicator">{@html doneSvg}</div>
    <p class="noselect">{doneMsg}</p>
  </div>
  <div
    class="error history-inner status"
    class:hidden={status !== HistoryStatus.Error}
  >
    <div class="indicator">{@html errorSvg}</div>
    <p class="noselect">{errorMsg}</p>
  </div>
  <div
    class="loading history-inner status"
    class:hidden={status !== HistoryStatus.Loading}
  >
    <i class="iconfont loading-icon">&#xe646;</i>
  </div>
</div>

<style>
  @keyframes in {
    from {
      display: none;
      opacity: 0;
    }
    to {
      opacity: 100;
    }
  }

  .history {
    position: relative;
    border-radius: 3px;
    transition: background 0.3s ease, box-shadow 0.3s ease;
  }

  .history::after {
    content: '';
    position: absolute;
    top: 0;
    z-index: -1;
    width: 100%;
    height: 100%;
    opacity: 0;
    border-radius: 3px;
    box-shadow: 0 0 2px 0 rgba(0, 0, 0, 0.2);
  }

  .history:not(:last-child) {
    margin-bottom: 0.5rem;
  }

  .history:hover {
    background: rgb(252, 252, 252);
  }

  .history:hover::after {
    opacity: 1;
  }

  .history.focused {
    background: white;
  }

  .history.focused::after {
    opacity: 1;
  }

  .history-inner {
    display: flex;
    height: 4rem;
    animation: in 0.3s;
    flex-direction: row-reverse;
    align-items: center;
  }

  .normal {
    cursor: pointer;
  }

  .status {
    justify-content: center;
  }

  .confirm-remove .left span {
    margin-left: 1rem;
  }

  .hidden {
    display: none !important;
  }

  .left {
    position: absolute;
    left: 0;
    display: flex;
    max-width: 95%;
    margin-left: 1rem;
  }

  .history.focused .left {
    width: calc(95% - 3 * min(4rem, max(2rem, 10%)));
  }

  .new-url {
    height: 100%;
    width: calc(95% - 2 * min(4rem, max(2rem, 10%))) !important;
  }

  .urls {
    flex-direction: column;
  }

  .urls p {
    display: inline-block;
    position: relative;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .urls p:first-child {
    color: rgba(63, 63, 63, 0.678);
    font-size: 0.8rem;
    top: 0.4rem;
  }

  .urls p:last-child {
    color: var(--blue);
    font-size: 1.1rem;
  }

  @keyframes spin {
    from {
      transform: rotate(0.3turn);
    }
    to {
      transform: rotate(1.3turn);
    }
  }
  .loading i {
    color: var(--blue);
  }

  .error {
    color: var(--red);
  }

  .done {
    position: relative;
    overflow: hidden;
    justify-content: flex-end;
    border-radius: inherit;
  }

  .done p {
    position: absolute;
    z-index: 10;
  }

  .error {
    position: relative;
    overflow: hidden;
    justify-content: flex-end;
    border-radius: inherit;
  }

  .error p {
    position: absolute;
    z-index: 10;
  }

  @keyframes left-to-right {
    from {
      left: -4rem;
    }
    to {
      left: 0;
    }
  }

  .done .indicator {
    background: var(--green);
  }

  .error .indicator {
    background: var(--red);
  }

  .indicator {
    position: absolute;
    height: 100%;
    width: 4rem;

    animation: left-to-right 1s;
    left: 0;
    display: flex;
    flex-direction: row-reverse;
    justify-content: center;
    align-items: center;
  }

  .indicator svg {
    z-index: 10;
  }

  @keyframes left-to-right-p {
    from {
      left: 2rem;
    }
    to {
      left: 6rem;
    }
  }

  .done p {
    animation: left-to-right-p 1s;
    left: 6rem;
  }

  .error p {
    animation: left-to-right-p 1s;
    left: 6rem;
  }

  .loading-icon {
    display: block;
    color: white;
    font-size: 1.3rem;
    animation: spin 0.7s infinite;
  }

  :global(.inline-button) {
    height: 100%;
    width: min(4rem, max(2rem, 10%));
  }
</style>
