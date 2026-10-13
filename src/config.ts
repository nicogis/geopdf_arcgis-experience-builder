import type { ImmutableObject } from 'seamless-immutable'

export interface Config {
  allowLocalUpload?: boolean
  widgetBaseUrl?: string
}

export type IMConfig = ImmutableObject<Config>