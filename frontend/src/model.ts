export type Callback = () => void

export interface HistoryProp {
  oldUrl: string
  newUrl: string
  token: string
  key: string
  ttl?: number
  // Called on focused
  // Return a callback whenever another is history is focused
  // So it can get out of focus
  focusedCallback: (cb: Callback) => void
}

export enum ManageEvent {
  Copy,
  Remove,
  RemoveConfirm,
  RemoveCancel,
  Edit,
  EditConfirm,
  EditCancel
}

export enum HistoryStatus {
  Normal,
  Editing,
  Removing,
  Loading,
  Error,
  Done
}
