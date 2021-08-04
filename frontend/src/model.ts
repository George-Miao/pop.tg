export type Callback = () => void

export interface HistoryStored {
  oldUrl: string
  newUrl: string
  token: string
  key: string
  ttl?: number
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

export enum GoButtonStatus {
  Disabled = 'disabled',
  Loading = 'loading',
  Normal = 'normal'
}
