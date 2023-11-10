require('@orbiting/backend-modules-env').config()
const dayjs = require('dayjs')
const duration = require('dayjs/plugin/duration')
const yargs = require('yargs')
const { calculateKpis } = require('../../lib/calculateKpis')

dayjs.extend(duration)

const argv = yargs
  .option('company', {
    alias: 'c',
    string: true,
    default: 'PROJECT_R',
  })
  .option('begin', {
    alias: 'b',
    describe: '(day in) first month e.g. 2019-02-01',
    coerce: dayjs,
    default: dayjs().subtract(1, 'month'),
  })
  .option('end', {
    alias: 'e',
    describe: '(day in) last month e.g. 2019-03-01',
    coerce: dayjs,
    default: dayjs().subtract(1, 'month'),
  })
  .help()
  .version().argv

calculateKpis({
  beginDate: argv.begin,
  endDate: argv.end,
  company: argv.company,
})
  .then((kpiData) => {
    console.log(
      `KPIs calculated between ${argv.begin} and ${argv.end} for company ${argv.company}`,
    )
    console.log(JSON.stringify(kpiData))
  })
  .catch((e) => {
    console.error(e)
  })
