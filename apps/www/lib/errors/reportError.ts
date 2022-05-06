import chalk from 'chalk'
import useragent from '../../server/useragent'

function reportError(userAgentValue: string, value: any) {
  console.warn(
    chalk.yellow(
      'reportError from',
      useragent(userAgentValue),
      JSON.stringify(value),
    ),
  )
}

export default reportError
