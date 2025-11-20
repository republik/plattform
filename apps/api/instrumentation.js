const { NodeSDK } = require('@opentelemetry/sdk-node')

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
