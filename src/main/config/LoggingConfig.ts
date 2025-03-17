import winston from 'winston';
import LokiTransport from 'winston-loki'

interface LoggingInterface {
    info: (...message: any) => any
    warn: (...message: any) => any
    error: (...message: any) => any
    verbose: (...message: any) => any
}

let errorCon = false
const transports: winston.transport[] = []
transports.push(new LokiTransport({
    host: process.env.LOGGING_URI!,
    json: true,
    batching: true,
    labels: { service_name: process.env.SERVICE_NAME },
    onConnectionError(error) {
        if (!errorCon) {
            console.log(error)
            errorCon = true
        }
    },

}))
if (process.env.NODE_ENV == 'development')
    // Log on console command if it's development
    transports.push(new winston.transports.Console())

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.json(),
        winston.format.prettyPrint(),
        winston.format.splat(),
        winston.format.printf((info) => {
            if (typeof info.message === 'object') {
                info.message = JSON.stringify(info.message, null, 3)
            }

            return info.message as string
        })
    ),
    transports
})

const Logging: LoggingInterface = {
    info: logger.info.bind(logger),
    warn: logger.warn.bind(logger),
    error: logger.error.bind(logger),
    verbose: logger.verbose.bind(logger),
}

Logging.info("Logging Configured")

export default Logging