import { query } from "express-validator"

export const paginationValidation = [
    query("page")
        .optional()
        .isNumeric(),
    query("page_size")
        .optional()
        .isNumeric()
]
export type paginationType = {
    page: number
    pageSize: number
}