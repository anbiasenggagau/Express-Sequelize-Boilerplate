import { body } from "express-validator";

export const createAttributesValidation = [
    body("name")
        .isString(),
    body("address")
        .isString(),
    body("phoneNumber")
        .isMobilePhone("any")
]

export const updateAttributesValidation = [
    body("name")
        .optional()
        .isString(),
    body("address")
        .optional()
        .isString(),
    body("phoneNumber")
        .optional()
        .isMobilePhone("any")
]

export type CreateAttributesBody = {
    name: string
    address: string
    phoneNumber: string
}

export type UpdateAttributesBody = {
    name?: string
    address?: string
    phoneNumber?: string
}