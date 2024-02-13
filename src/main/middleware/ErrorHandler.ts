import { ValidationChain, validationResult } from "express-validator";
import express from "express"

function errorHandler(ValidationList: ValidationChain[]) {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.sendStatus(400)
        }

        next()
    }
}