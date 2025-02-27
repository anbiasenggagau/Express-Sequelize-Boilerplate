import expres from "express"
import { performance } from "perf_hooks"
import Logging from "../config/LoggingConfig"

export function handleLogging(req: expres.Request, res: expres.Response, next: expres.NextFunction) {
    const start = performance.now()

    // Asynchronous Logging
    res.on("finish", () => {
        return logging(req, res, start)
    })

    next()
}

async function logging(req: expres.Request, res: expres.Response, start: number) {
    Logging.info({
        time: new Date().toString(),
        method: req.method,
        ipClient: req.ip,
        originalUrl: req.originalUrl,
        user: req.user,
        responseTime: performance.now() - start,
        statusCode: res.statusCode,
    })

    Logging.info("======================================================")
}