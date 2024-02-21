import expres from "express"
import { performance } from "perf_hooks"
import LoggingRepo from "../model/repository/ExtensionRepository/LoggingRepo"

export function handleLogging(req: expres.Request, res: expres.Response, next: expres.NextFunction) {
    const start = performance.now()
    res.on("finish", () => {
        const loggingRepo = LoggingRepo

        if (req.user) loggingRepo.insertNewData({
            UserId: req.user.id,
            Username: req.user.username,
            Endpoint: req.originalUrl,
            StatusCode: res.statusCode
        })

        console.log("======================================================")
        console.log(
            {
                time: new Date().toString(),
                method: req.method,
                hostname: req.hostname,
                originalUrl: req.originalUrl,
                user: req.user,
                responseTime: performance.now() - start,
                statusCode: res.statusCode,
            }
        )
        console.log("======================================================")
    })

    next()
}