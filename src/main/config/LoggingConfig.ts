import winston from 'winston';
import LokiTransport from 'winston-loki'

interface LoggingInterface {
    info: (...message: any) => any | any
    warn: (...message: any) => any | any
    debug: (...message: any) => any | any
    http: (...message: any) => any | any
    verbose: (...message: any) => any | any
    silly: (...message: any) => any | any
}

let Logging: LoggingInterface
try {
    const transports: winston.transport[] = []
    transports.push(new LokiTransport({
        host: process.env.LOGGING_URI!,
        json: true,
        batching: true,
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

    Logging = {
        info: logger.info.bind(logger),
        warn: logger.warn.bind(logger),
        debug: logger.debug.bind(logger),
        http: logger.http.bind(logger),
        verbose: logger.verbose.bind(logger),
        silly: logger.silly.bind(logger),
    }

} catch (error) {
    console.log("Winston initialization error, will use console.log instead")
    console.log(error)
    Logging = {
        info: console.log,
        warn: console.log,
        debug: console.log,
        http: console.log,
        verbose: console.log,
        silly: console.log,
    }
}

export default Logging