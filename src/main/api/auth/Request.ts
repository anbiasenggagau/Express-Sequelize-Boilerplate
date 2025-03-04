import { body, checkExact, oneOf } from "express-validator"

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

export const refreshTokenValidation = [
    checkExact([
        body("refreshToken")
            .optional()
            .isUUID()
    ])
]

export interface LoginAttributeBody {
    email?: string
    username?: string
    password: string
}