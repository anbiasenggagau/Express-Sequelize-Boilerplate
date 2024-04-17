import express from "express"
import { ValidationError } from "express-validator"
import { StatusCode } from "../const"

class BaseResponse {
    OKWithEmptyData(response: express.Response, message: string) {
        const finalResponse = {
            message,
            statusCode: 200
        }

        return response.status(200).json(finalResponse)
    }

    OKWithData<T>(response: express.Response, message: string, data: T) {
        const finalResponse = {
            message,
            statusCode: 200,
            data
        }

        return response.status(200).json(finalResponse)
    }

    OKWithDataPagination<T>(response: express.Response, message: string, data: T[], pagination: { page: number, pageSize: number }, dataTotal: number) {
        const paginationResult = this.constructPagination(pagination, dataTotal)

        const finalResponse = {
            message,
            statusCode: 200,
            ...paginationResult,
            data
        }

        return response.status(200).json(finalResponse)
    }

    CreatedNewData<T>(response: express.Response, message: string, data?: T) {
        const finalResponse = {
            message,
            statusCode: 201,
            data
        }

        return response.status(201).json(finalResponse)
    }

    NotFound(response: express.Response, message: string) {
        const finalResponse = {
            message,
            statusCode: 404,
        }

        return response.status(404).json(finalResponse)
    }

    BadRequest(response: express.Response, message: string) {
        const finalResponse = {
            message,
            statusCode: 400,
        }

        return response.status(400).json(finalResponse)
    }

    ErrorValidation(response: express.Response, data: ValidationError[]) {
        const finalResponse = {
            message: "Error Validation",
            statusCode: 400,
            data
        }

        return response.status(400).json(finalResponse)
    }

    Unauthorized(response: express.Response) {
        return response.sendStatus(401)
    }

    Forbidden(response: express.Response, message?: string) {
        if (message)
            return response.status(403).json({
                message,
                statusCode: 403
            })

        return response.sendStatus(403)
    }

    InternalServerError(response: express.Response) {
        return response.status(500).json({
            message: "Internal error occured, please contact administrator",
            statusCode: 500
        })
    }

    SendOnlyStatusCode(response: express.Response, statusCode: StatusCode) {
        return response.sendStatus(statusCode)
    }

    SendCustomResponse(response: express.Response, statusCode: StatusCode, message: string, data?: any) {
        return response.status(statusCode).json({
            message,
            statusCode,
            data
        })
    }

    handleErrorStatusCode(response: express.Response, statusCode: StatusCode, message: string, errorValidationList?: ValidationError[]) {
        if (statusCode == 400 && errorValidationList) this.ErrorValidation(response, errorValidationList)
        else if (statusCode == 400 && !errorValidationList) this.BadRequest(response, message)
        else if (statusCode == 404) this.NotFound(response, message)
        else if (statusCode == 401) this.Unauthorized(response)
        else if (statusCode == 403) this.Forbidden(response, message)
        else this.SendOnlyStatusCode(response, statusCode)
    }

    protected getLastPage(dataTotal: number, pageSize: number): number {
        let result = dataTotal / pageSize
        if (result % pageSize == 0 && result != 0) return result
        else return parseInt(result.toString()) + 1
    }

    protected constructPagination(pagination: { page: number, pageSize: number }, dataTotal: number) {
        let from = dataTotal == 0 ? 0 : 1
        let to = dataTotal == 0 ? 0 : (pagination.page * pagination.pageSize)

        if (pagination.page != 1 && dataTotal > 0) from = ((pagination.page - 1) * pagination.pageSize) + 1
        if (to > dataTotal) to = to - pagination.pageSize + (dataTotal - (to - pagination.pageSize))

        return {
            pageNumber: pagination.page,
            pageSize: pagination.pageSize,
            totalPages: this.getLastPage(dataTotal, pagination.pageSize),
            fromItem: from,
            toItem: to,
            totalItem: dataTotal
        }
    }
}

export default BaseResponse