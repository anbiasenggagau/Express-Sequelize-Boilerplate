import { ValidationError } from "express-validator"
import { StatusCode } from "../const"

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