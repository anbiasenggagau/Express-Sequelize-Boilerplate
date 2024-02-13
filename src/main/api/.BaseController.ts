import express from "express"
import { validationResult } from "express-validator"
import ErrorHandler from "../middleware/ErrorHandler"

class BaseController {
    public validateRequest(req: express.Request, res: express.Response) {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            throw new ErrorHandler(400, "Error Validation", errors.array())
        }
    }
}

export default BaseController