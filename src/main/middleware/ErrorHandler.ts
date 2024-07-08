import { ValidationError } from "express-validator"
import { StatusCode } from "../const"
import expres from "express"
import { ForeignKeyConstraintError, ValidationError as ValidationErrorSequelize } from "sequelize"
import BaseResponse from "../api/.BaseResponse"

const response = new BaseResponse()

export function handleError(error: unknown, req: expres.Request, res: expres.Response, next: expres.NextFunction) {
    console.log(error)
    if (error instanceof ErrorHandler)  // Handle error from manually thrown error
        return response.handleErrorStatusCode(res, error.statusCode, error.message, error.errorValidationList)
    else if (error instanceof ValidationErrorSequelize)   // Handle error from sequelize validation
    {
        if (error.errors.some(value => (value.type) as any == "notNull Violation"))
            return response.InternalServerError(res)
        else if (error.errors.some(value => (value.type) == "unique violation")) {
            const message = error.errors[0].message.replaceAll(" must be unique", ": same value is already exists")
            return response.BadRequest(res, message)
        }
        return response.BadRequest(res, error.errors[0].message)
    }
    else if (error instanceof ForeignKeyConstraintError)     // Handle error from sequelize foreign key
        return response.BadRequest(res, (error as any).parent.detail)
    else if (error instanceof SyntaxError && error.hasOwnProperty("statusCode")) {
        return response.SendCustomResponse(res, (error as any)["statusCode"], error.message)
    }
    else if (error instanceof TransactionErrorHandler) {
        handleError(error.errorInstancece, req, res, next)
    }
    else
        return response.InternalServerError(res)
}

class ErrorHandler extends Error {
    statusCode: StatusCode
    message: string
    errorValidationList?: ValidationError[] = []

    // errorValidationList only apply for validating Body Request using express-validator
    constructor(statusCode: StatusCode, message?: string, errorValidationList?: ValidationError[]) {
        super()
        this.message = message ?? ""
        this.statusCode = statusCode
        this.errorValidationList = errorValidationList
    }
}

export class TransactionErrorHandler extends Error {
    errorInstancece: unknown

    constructor(errorInstance: unknown) {
        super()
        this.errorInstancece = errorInstance
    }
}

export default ErrorHandler