import { body, oneOf } from "express-validator"

export const loginAttributeValidation = [
    oneOf([
        body("email")
            .isString(),
        body("username")
            .isString(),
    ]),
    body("password")
        .isString(),
]

export interface LoginAttributeBody {
    email?: string
    username?: string
    password: string
}