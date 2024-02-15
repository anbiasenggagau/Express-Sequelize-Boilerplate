import expres from "express"
import { performance } from "perf_hooks"

export function handleLogging(req: expres.Request, res: expres.Response, next: expres.NextFunction) {
    const start = performance.now()
    res.on("finish", () => {
        console.log(
            {
                method: req.method,
                hostname: req.hostname,
                originalUrl: req.originalUrl,
                user: req.user,
                responseTime: performance.now() - start,
                statusCode: res.statusCode,
            }
        )
    })

    next()
}