import { ValidationError } from "express-validator"
import { StatusCode } from "../const"
import expres from "express"
import { ForeignKeyConstraintError, ValidationError as ValidationErrorSequelize } from "sequelize"
import BaseResponse from "../api/.BaseResponse"

const response = new BaseResponse()

export function handleError(error: any, req: expres.Request, res: expres.Response, next: expres.NextFunction) {
    console.log(error)
    if (error instanceof ErrorHandler)  // Handle error from manually thrown error
        return response.handleErrorStatusCode(error.statusCode, error.message, res, error.errorValidationList)
    if (error instanceof ValidationErrorSequelize)   // Handle error from sequelize validation
        return response.BadRequest(error.errors[0].message, res)
    if (error instanceof ForeignKeyConstraintError)     // Handle error from sequelize foreign key
        return response.BadRequest((error as any).parent.detail, res)
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

export default ErrorHandler