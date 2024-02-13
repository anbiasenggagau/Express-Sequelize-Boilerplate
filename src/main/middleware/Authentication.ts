import express from "express"

export interface TokenPayload {
    id: string
    username: string
    // exp: number
    // iss: string
}

export function authenticate(req: express.Request, res: express.Response, next: express.NextFunction) {
    const user: TokenPayload = {
        id: 'f8532526-005e-49be-a529-436740ad952c',
        username: 'anbiasenggagau'
    }

    req.user = user

    next()
}