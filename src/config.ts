import type { ImmutableObject } from 'seamless-immutable'

export interface Config {
  allowLocalUpload?: boolean
  widgetBaseUrl?: string
  renderMaxSize?: 2048 | 4096 | 8192
}

export type IMConfig = ImmutableObject<Config>