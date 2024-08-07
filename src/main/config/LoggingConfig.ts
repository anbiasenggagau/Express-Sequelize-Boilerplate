import winston from 'winston';
import LokiTransport from 'winston-loki'

const transports: winston.transport[] = []
transports.push(new LokiTransport({
    host: process.env.LOGGING_URI!,
    json: true,
    batching: false,
    labels: { service_name: process.env.SERVICE_NAME },
    onConnectionError(error) {
        console.log(error)
    },
}))
if (process.env.NODE_ENV == 'development')
    transports.push(new winston.transports.Console())

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports
})

const Logging = {
    info: logger.info.bind(logger),
    warn: logger.warn.bind(logger),
    debug: logger.debug.bind(logger),
    http: logger.http.bind(logger),
    verbose: logger.verbose.bind(logger),
    silly: logger.silly.bind(logger),
}

export default Logging