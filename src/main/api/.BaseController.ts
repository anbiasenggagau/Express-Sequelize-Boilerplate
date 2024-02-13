import express from "express"
import { validationResult } from "express-validator"
import BaseResponse from "./.BaseResponse"

class BaseController {
    public validateRequest(req: express.Request, res: express.Response) {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            BaseResponse.ErrorValidation(errors.array(), res)
        }
    }
}

export default BaseController