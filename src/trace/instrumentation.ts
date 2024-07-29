import { NodeSDK } from "@opentelemetry/sdk-node"
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node"
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto"
import dotenv from "dotenv"
dotenv.config()

const otlpExporter = new OTLPTraceExporter({
    url: process.env.TRACING_URI
})

console.log(otlpExporter)
const sdk = new NodeSDK({
    serviceName: "Express-Sequelize-Boilerplate",
    traceExporter: otlpExporter,
    instrumentations: [getNodeAutoInstrumentations()],
})

sdk.start()
