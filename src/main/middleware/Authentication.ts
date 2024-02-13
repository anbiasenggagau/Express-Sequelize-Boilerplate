import express from "express"
import jwt from "jsonwebtoken"
import configData from "../config/GeneralConfig"

export interface TokenPayload {
    id: string
    username: string
    exp: number
    iss: string
}

export function authenticate(req: express.Request, res: express.Response, next: express.NextFunction) {
    const authHeader = req.headers["authorization"]
    const token = authHeader?.split(" ")[1]

    if (token == null) return res.sendStatus(401)

    jwt.verify(token, configData.JWT_SECRET, async (err, user) => {
        if (err) return res.sendStatus(403)
        req.user = user
        next()
    })

}