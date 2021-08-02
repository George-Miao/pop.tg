<script lang="ts">
  import { HistoryStatus, ManageEvent } from '../model'
  import type { HistoryProp } from '../model'
  import InlineButton from './InlineButton.svelte'
  import { createEventDispatcher } from 'svelte'
  import { deleteRecord, updateRecord } from '@/api'
  import { isValidUrl, sleep } from '@/util'

  export let prop: HistoryProp
  let newValue: string = ''

  let focused = false
  let status = HistoryStatus.Normal

  const eventDispatcher = createEventDispatcher()

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
    console.log('manage')
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
        deleteRecord({ key: prop.key })
          .then(e => {
            if (!e.success) {
              error(`Error deleting: [${e.status}] ${e.status_text}`)
            } else {
              done(`Done deleting ${prop.key}`).then(() =>
                eventDispatcher('delete', {
                  key: prop.key
                })
              )
            }
          })
          .catch(e => {
            error(`Error requesting: ${e}`)
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
        updateRecord({ key: prop.key, value: newValue, ttl: prop.ttl })
          .then(e => {
            if (!e.success) {
              error(`Error updating: [${e.status}] ${e.status_text}`)
            } else {
              done(`Done updatating ${prop.key}`).then(
                () => (prop.oldUrl = newValue)
              )
            }
          })
          .catch(e => {
            eventDispatcher('alert', `Error requesting: ${e}`)
            status = HistoryStatus.Normal
          })
          .finally(() => {
            newValue = ''
          })

        break
      }
      case ManageEvent.Copy: {
        done('Copied')
      }
    }
  }

  const exit = () => {
    cleanMsg()
    status = HistoryStatus.Normal
    focused = false
  }

  const historyClicked = () => {
    if (focused) {
      if (status === HistoryStatus.Normal) exit()
    } else {
      prop.focusedCallback(exit)
      focused = true
    }
  }
</script>

<div class="history" on:click={historyClicked} class:focused>
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
      <p class="old">{prop.oldUrl}</p>
      <p class="new">{prop.newUrl}</p>
    </div>
  </div>
  <div
    class="confirm-remove history-inner"
    class:hidden={status !== HistoryStatus.Removing}
  >
    <div class="left">
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
    <p>{doneMsg}</p>
  </div>
  <div
    class="error history-inner status"
    class:hidden={status !== HistoryStatus.Error}
  >
    {errorMsg}
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
    cursor: pointer;
    border-radius: 3px;
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
    font-size: 0.9rem;
  }

  .urls p:first-child {
    color: rgba(63, 63, 63, 0.678);
  }

  .urls p:last-child {
    color: #3797ff;
  }

  @keyframes spin {
    from {
      transform: rotate(0turn);
    }
    to {
      transform: rotate(-1turn);
    }
  }
  .loading i {
    color: rgba(44, 134, 252, 0.8);
  }

  .error {
    color: rgba(250, 65, 59, 0.8);
  }

  .done {
    position: relative;
    overflow: hidden;
    justify-content: flex-end;
    border-radius: inherit;
  }

  .done p {
    margin-left: 20%;
    z-index: 10;
  }

  @keyframes left-to-right {
    from {
      left: -100%;
    }
    to {
      left: -85%;
    }
  }

  .done::before {
    content: '';
    position: absolute;
    height: 100%;
    width: 100%;
    background: #4dcb62;
    animation: left-to-right 1s;
    left: -85%;
  }

  .loading-icon {
    display: block;
    color: rgba(255, 255, 255, 0.98);
    font-size: 1.3rem;
    animation: spin 0.7s infinite;
  }

  :global(.inline-button) {
    height: 100%;
    width: min(4rem, max(2rem, 10%));
  }
</style>
