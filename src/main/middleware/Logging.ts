import expres from "express"
import { performance } from "perf_hooks"
import LoggingRepo from "../model/repository/ExtensionRepository/LoggingRepo"

export function handleLogging(req: expres.Request, res: expres.Response, next: expres.NextFunction) {
    const start = performance.now()

    // Asynchronous Logging
    res.on("finish", () => {
        // Consider to deactivate logging to database if not implemented
        const loggingRepo = LoggingRepo
        if (req.user) loggingRepo.insertNewData({
            UserId: req.user.id,
            Username: req.user.username,
            Endpoint: req.originalUrl,
            StatusCode: res.statusCode
        })

        return logging(req, res, start)
    })

    next()
}

async function logging(req: expres.Request, res: expres.Response, start: number) {
    console.log("======================================================")
    console.log(
        {
            time: new Date().toString(),
            method: req.method,
            ipClient: req.ip,
            originalUrl: req.originalUrl,
            user: req.user,
            responseTime: performance.now() - start,
            statusCode: res.statusCode,
        }
    )
    console.log("======================================================")
}