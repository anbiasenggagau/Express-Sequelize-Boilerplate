import express from "express"
import { checkExact, query, validationResult } from "express-validator"
import ErrorHandler from "../middleware/ErrorHandler"

export type PaginationType = {
    page: number
    pageSize: number
    softDeleted?: boolean
    search?: string
}

export const paginationValidation = [
    checkExact([
        query("page")
            .optional()
            .isInt(),
        query("page_size")
            .optional()
            .isInt(),
        query("search")
            .optional(),
        query("include_deleted")
            .optional()
            .isBoolean()
    ])
]

abstract class BaseController {
    public validateRequest(req: express.Request) {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            throw new ErrorHandler(400, "Error Validation", errors.array())
        }
    }

    public initPagination(req: express.Request): PaginationType {
        const result: PaginationType = {
            page: 1,
            pageSize: 10,
            search: req.query.search as any,
        }

        if (req.query.page) result.page = parseInt(req.query.page as string)
        if (req.query.page_size) result.pageSize = parseInt(req.query.page_size as string)
        if (req.query.include_deleted == "true") result.softDeleted = true

        return result
    }
}

export default BaseController