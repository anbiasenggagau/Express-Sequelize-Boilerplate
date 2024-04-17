import express from "express"
import jwt from "jsonwebtoken"
import configData from "../config/GeneralConfig"
import SessionUtility from "../utility/SessionUtiliity"

export interface TokenPayload {
    id: string
    username: string
    exp: number
    iat: number
}

export function authenticate(req: express.Request, res: express.Response, next: express.NextFunction) {
    const authHeader = req.headers["authorization"]
    const token = authHeader?.split(" ")[1]

    if (token == null) return res.sendStatus(401)

    jwt.verify(token, configData.JWT_SECRET, async (err, user) => {
        if (err) return res.status(403).json({ message: err.message })
        req.user = user

        const blocked = await SessionUtility.getBlockedToken(req.user)
        if (blocked != null)
            return res.status(403).json({ message: "jwt expired" })

        next()
    })
}