import { body } from "express-validator";

export const createAttributesValidation = [
    body("email")
        .isString(),
    body("username")
        .isString(),
    body("password")
        .isString(),
]

export const updateAttributesValidation = [
    body("email")
        .optional()
        .isString(),
    body("username")
        .optional()
        .isString(),
    body("password")
        .optional()
        .isString(),
]

export type CreationAttributesBody = {
    email: string
    username: string
    password: string
}

export type UpdateAttributesBody = {
    email?: string
    username?: string
    password?: string
}