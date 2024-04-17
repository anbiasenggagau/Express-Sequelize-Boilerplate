import { body, query } from "express-validator";

export const createAttributesValidation = [
    body("name")
        .isString(),
    body("price")
        .isNumeric(),
    body("currency")
        .isIn(["IDR", "USD"]),
]

export const updateAttributeValidation = [
    body("name")
        .optional()
        .isString(),
    body("price")
        .optional()
        .isNumeric(),
    body("currency")
        .optional()
        .isIn(["IDR", "USD"]),
    query("id")
        .exists()
]

export const paginationValidation = [
    query("page")
        .optional()
        .isNumeric(),
    query("page_size")
        .optional()
        .isNumeric()
]

export const deleteValidation = [
    query("id")
        .exists()
]

export type paginationType = {
    page: number
    pageSize: number
}

export type CreateAttributeBody = {
    name: string
    price: number
    currency: string
}

export type UpdateAttributeValidation = {
    name?: string
    price?: number
    currency?: string
}