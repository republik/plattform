import { config as italic } from './italic'
import { config as bold } from './bold'
import { config as sup } from './sup'
import { config as sub } from './sub'
import { config as strikethrough } from './strikethrough'
import { config as invisible } from './invisible'
import { config as error } from './error'

import { MarksConfig } from '../../custom-types'

export const config: MarksConfig = {
  italic,
  bold,
  strikethrough,
  sup,
  sub,
  invisible,
  error,
}

// typesafe helper
export const configKeys: (keyof MarksConfig)[] = Object.keys(
  config,
) as (keyof MarksConfig)[]

// "marks" which aren't a style per se
export const MARKS_ALLOW_LIST = ['sup', 'sub']
