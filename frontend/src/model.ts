import type { URLRecord } from '@back/model'
import * as yup from 'yup'

const historiesSchema = yup.array().of(
  yup.object({
    key: yup.string().required(),
    oldUrl: yup.string().required(),
    newUrl: yup.string().required(),
    token: yup.string().required(),
    ttl: yup.number().min(60).optional()
  })
)

export const isValidHistories = (histories: HistoryStored[]) =>
  historiesSchema.isValid(histories)

export const verifyHistory = (a: HistoryStored, b: URLRecord) => {
  return a.key === b.key && a.oldUrl === b.value
}

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
