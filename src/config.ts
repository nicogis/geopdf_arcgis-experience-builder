import type { ImmutableObject } from 'seamless-immutable'

export interface Config {
  allowLocalUpload?: boolean
}

export type IMConfig = ImmutableObject<Config>