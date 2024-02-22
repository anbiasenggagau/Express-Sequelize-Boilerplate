import { body } from "express-validator";

export const createAttributesValidation = [
    body("name")
        .isString()
]

export const updateAttributeValidation = [
    body("name")
        .isString()
]

export type CreateAttributeBody = {
    name: string
}

export type UpdateAttributeValidation = {
    name: string
}