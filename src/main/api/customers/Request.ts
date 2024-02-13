import { body } from "express-validator";

export const createAttributesValidation = [
    body("name")
        .exists()
        .isString(),
    body("email")
        .exists()
        .isEmail(),
    body("address")
        .exists()
        .isString(),
    body("phoneNumber")
        .exists()
        .isMobilePhone("any")
]

export type CreateAttributesBody = {
    name: string
    email: string
    address: string
    phoneNumber: string
}