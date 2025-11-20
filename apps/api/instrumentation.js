const { NodeSDK } = require('@opentelemetry/sdk-node')

const { resourceFromAttributes } = require('@opentelemetry/resources')
const { ATTR_SERVICE_VERSION } = require('@opentelemetry/semantic-conventions')

const {
  OTLPTraceExporter,
} = require('@opentelemetry/exporter-trace-otlp-proto')

const {
  OTLPMetricExporter,
} = require('@opentelemetry/exporter-metrics-otlp-proto')

const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node')

const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics')

const {
  GraphQLInstrumentation,
} = require('@opentelemetry/instrumentation-graphql')

const {
  DataloaderInstrumentation,
} = require('@opentelemetry/instrumentation-dataloader')

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_VERSION]:
      process.env.HEROKU_RELEASE_VERSION || 'unknown-version',
    'service.instance.id': process.env.HEROKU_DYNO_ID,
    'heroku.instance.name': process.env.DYNO,
    'heroku.release.commit': process.env.HEROKU_SLUG_COMMIT,
    'heroku.release.description': process.env.HEROKU_SLUG_DESCRIPTION,
  }),
  traceExporter: new OTLPTraceExporter(),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter(),
  }),
  instrumentations: [
    getNodeAutoInstrumentations(),
    new GraphQLInstrumentation(),
    new DataloaderInstrumentation(),
  ],
})

sdk.start()
