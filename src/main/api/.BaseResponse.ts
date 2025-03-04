import express from "express"
import { ValidationError } from "express-validator"
import { StatusCode } from "../const"
import { PaginationType } from "./.BaseController"

type DataWithCount<T> = {
    data: T[]
    count: number
}

class BaseResponse {
    OK(response: express.Response, message: string): express.Response;
    OK<T>(response: express.Response, message: string, data: T): express.Response;
    OK<T>(response: express.Response, message: string, pagination: PaginationType, data: DataWithCount<T>): express.Response;
    OK<T>(response: express.Response, message: string, paginationOrData?: PaginationType | T | DataWithCount<T>, dataOrUndefined?: DataWithCount<T>): express.Response {
        if (paginationOrData === undefined && dataOrUndefined === undefined) {
            return response.status(200).json({
                statusCode: 200,
                message,
            })
        }
        else if (paginationOrData && (!paginationOrData.hasOwnProperty("page") && !paginationOrData.hasOwnProperty("pageSize"))) {
            return response.status(200).json({
                statusCode: 200,
                message,
                data: paginationOrData
            })
        }
        else {
            const pagination = paginationOrData as PaginationType
            const dataWithCount = dataOrUndefined as DataWithCount<T>
            const paginationResult = this.constructPagination(pagination, dataWithCount.count)

            if (pagination.page > paginationResult.totalPages) {
                return response.status(404).json({
                    statusCode: 404,
                    message: "Not Data Found",
                })
            }

            return response.status(200).json({
                statusCode: 200,
                message,
                ...paginationResult,
                data: dataWithCount.data
            })
        }
    }

    CreatedNewData(response: express.Response, message: string, id: number | string | Array<string | number>) {
        const finalResponse = {
            statusCode: 201,
            message,
            data: {
                id
            }
        }

        return response.status(201).json(finalResponse)
    }

    NotFound(response: express.Response, message: string) {
        const finalResponse = {
            statusCode: 404,
            message,
        }

        return response.status(404).json(finalResponse)
    }

    BadRequest(response: express.Response, message: string, userMessage: boolean = true) {
        const finalResponse = {
            statusCode: 400,
            message,
            userMessage,
        }

        return response.status(400).json(finalResponse)
    }

    ErrorValidation(response: express.Response, data: ValidationError[]) {
        const finalResponse = {
            statusCode: 400,
            message: "Error Validation",
            userMessage: false,
            data
        }

        return response.status(400).json(finalResponse)
    }

    Unauthorized(response: express.Response, message?: string) {
        if (!message) return response.sendStatus(401)
        const finalResponse = {
            statusCode: 401,
            message,
        }
        return response.status(401).json(finalResponse)
    }

    Forbidden(response: express.Response, message?: string) {
        if (message)
            return response.status(403).json({
                statusCode: 403,
                message,
            })

        return response.sendStatus(403)
    }

    InternalServerError(response: express.Response) {
        return response.status(500).json({
            statusCode: 500,
            message: "Internal error occured, please contact administrator",
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

    handleErrorStatusCode(response: express.Response, statusCode: StatusCode, message: string, errorValidationList?: ValidationError[], userMessage: boolean = true) {
        if (statusCode == 400 && errorValidationList) return this.ErrorValidation(response, errorValidationList)
        else if (statusCode == 400 && !errorValidationList) return this.BadRequest(response, message, userMessage)
        else if (statusCode == 404) return this.NotFound(response, message)
        else if (statusCode == 401) return this.Unauthorized(response, message)
        else if (statusCode == 403) return this.Forbidden(response, message)
        else return this.SendOnlyStatusCode(response, statusCode)
    }

    protected getLastPage(dataTotal: number, pageSize: number): number {
        let result = dataTotal / pageSize
        if (dataTotal % pageSize != 0) return parseInt(result.toString()) + 1
        else return result
    }

    protected constructPagination(pagination: { page: number, pageSize: number }, dataTotal: number) {
        let from = dataTotal == 0 ? 0 : 1
        let to = dataTotal == 0 ? 0 : (pagination.page * pagination.pageSize)

        if (pagination.page != 1 && dataTotal > 0) from = ((pagination.page - 1) * pagination.pageSize) + 1
        if (to > dataTotal) to = dataTotal

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