import { body } from "express-validator";

export const createAttributesValidation = [
    body("name")
        .isString(),
    body("address")
        .isString(),
    body("phoneNumber")
        .isMobilePhone("any")
]

export type CreateAttributesBody = {
    name: string
    address: string
    phoneNumber: string
}