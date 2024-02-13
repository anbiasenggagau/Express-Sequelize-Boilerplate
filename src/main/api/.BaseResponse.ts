import express from "express"

class BaseResponse {
    static OKWithEmptyData(message: string, response: express.Response) {
        const finalResponse = {
            message,
            statusCode: 200
        }

        response.status(200).json(finalResponse)
    }

    static OKWithData<T>(message: string, data: T, response: express.Response) {
        const finalResponse = {
            message,
            statusCode: 200,
            data
        }

        response.status(200).json(finalResponse)
    }

    static OKWithDataPagination<T>(message: string, data: T[], pagination: { currentPage: number, pageSize: number }, dataTotal: number, response: express.Response) {
        const paginationResult = this.constructPagination(pagination, dataTotal)

        const finalResponse = {
            message,
            statusCode: 200,
            ...paginationResult,
            data
        }

        response.status(200).json(finalResponse)
    }

    static CreatedNewData(message: string, response: express.Response) {
        const finalResponse = {
            message,
            statusCode: 201
        }

        response.status(201).json(finalResponse)
    }

    static NotFound(message: string, response: express.Response) {
        const finalResponse = {
            message,
            statusCode: 404,
        }

        response.status(404).json(finalResponse)
    }

    static BadRequest(message: string, response: express.Response) {
        const finalResponse = {
            message,
            statusCode: 400,
        }

        response.status(400).json(finalResponse)
    }

    static ErrorValidation<T>(data: T[], response: express.Response) {
        const finalResponse = {
            message: "Error Validation",
            statusCode: 400,
            data
        }

        response.status(400).json(finalResponse)
    }

    static Unauthorized(response: express.Response) {
        response.sendStatus(401)
    }

    static Forbidden(response: express.Response) {
        response.sendStatus(403)
    }

    static getLastPage(dataTotal: number, pageSize: number): number {
        let result = dataTotal / pageSize
        if (result % pageSize == 0 && result != 0) return result
        else return parseInt(result.toString()) + 1
    }

    static constructPagination(pagination: { currentPage: number, pageSize: number }, dataTotal: number) {
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