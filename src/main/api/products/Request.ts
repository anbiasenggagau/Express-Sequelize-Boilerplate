import { body } from "express-validator";

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
]

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