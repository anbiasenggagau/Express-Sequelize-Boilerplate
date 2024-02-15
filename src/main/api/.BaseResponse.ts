import express from "express"
import { ValidationError } from "express-validator"
import { StatusCode } from "../const"

class BaseResponse {
    OKWithEmptyData(message: string, response: express.Response) {
        const finalResponse = {
            message,
            statusCode: 200
        }

        response.status(200).json(finalResponse)
    }

    OKWithData<T>(message: string, data: T, response: express.Response) {
        const finalResponse = {
            message,
            statusCode: 200,
            data
        }

        response.status(200).json(finalResponse)
    }

    OKWithDataPagination<T>(message: string, data: T[], pagination: { currentPage: number, pageSize: number }, dataTotal: number, response: express.Response) {
        const paginationResult = this.constructPagination(pagination, dataTotal)

        const finalResponse = {
            message,
            statusCode: 200,
            ...paginationResult,
            data
        }

        response.status(200).json(finalResponse)
    }

    CreatedNewData(message: string, response: express.Response) {
        const finalResponse = {
            message,
            statusCode: 201
        }

        response.status(201).json(finalResponse)
    }


    NotFound(message: string, response: express.Response) {
        const finalResponse = {
            message,
            statusCode: 404,
        }

        response.status(404).json(finalResponse)
    }

    BadRequest(message: string, response: express.Response) {
        const finalResponse = {
            message,
            statusCode: 400,
        }

        response.status(400).json(finalResponse)
    }

    ErrorValidation(data: ValidationError[], response: express.Response) {
        const finalResponse = {
            message: "Error Validation",
            statusCode: 400,
            data
        }

        response.status(400).json(finalResponse)
    }

    Unauthorized(response: express.Response) {
        response.sendStatus(401)
    }

    Forbidden(response: express.Response) {
        response.sendStatus(403)
    }

    InternalServerError(response: express.Response) {
        response.status(500).json({
            message: "Internal error occured, please contact administrator",
            statusCode: 500
        })
    }

    SendOnlyStatusCode(statusCode: StatusCode, response: express.Response) {
        response.sendStatus(statusCode)
    }

    handleErrorStatusCode(statusCode: StatusCode, message: string, response: express.Response, errorValidationList?: ValidationError[]) {
        if (statusCode == 400 && errorValidationList) this.ErrorValidation(errorValidationList, response)
        else if (statusCode == 400 && !errorValidationList) this.BadRequest(message, response)
        else if (statusCode == 404) this.NotFound(message, response)
        else if (statusCode == 401) this.Unauthorized(response)
        else if (statusCode == 403) this.Forbidden(response)
        else this.SendOnlyStatusCode(statusCode, response)
    }

    getLastPage(dataTotal: number, pageSize: number): number {
        let result = dataTotal / pageSize
        if (result % pageSize == 0 && result != 0) return result
        else return parseInt(result.toString()) + 1
    }

    constructPagination(pagination: { currentPage: number, pageSize: number }, dataTotal: number) {
        let from = 1
        let to = (pagination.currentPage * pagination.pageSize)

        if (pagination.currentPage != 1) from = (pagination.currentPage - 1 * pagination.pageSize) + 1
        if (to > dataTotal) to = to - pagination.pageSize + (dataTotal - (to - pagination.pageSize))

        return {
            pageNumber: pagination.currentPage,
            pageSize: pagination.pageSize,
            totalPages: this.getLastPage(dataTotal, pagination.pageSize),
            itemFrom: from,
            itemTo: to,
            totalItem: dataTotal
        }
    }
}

export default BaseResponse