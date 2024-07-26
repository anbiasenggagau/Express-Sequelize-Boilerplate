import { NodeSDK } from "@opentelemetry/sdk-node"
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node"
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto"

const otlpExporter = new OTLPTraceExporter({
    url: "http://localhost:4318/v1/traces"
})

console.log(otlpExporter)
const sdk = new NodeSDK({
    serviceName: "Express-Sequelize-Boilerplate",
    traceExporter: otlpExporter,
    instrumentations: [getNodeAutoInstrumentations()],
})

sdk.start()
