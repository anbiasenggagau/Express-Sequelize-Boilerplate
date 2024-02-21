import express from "express"
import jwt from "jsonwebtoken"
import configData from "../config/GeneralConfig"
import MemCacheUtility from "../utility/MemCacheUtility"

export interface TokenPayload {
    id: string
    username: string
    exp: number
}

export function authenticate(req: express.Request, res: express.Response, next: express.NextFunction) {
    const authHeader = req.headers["authorization"]
    const token = authHeader?.split(" ")[1]

    if (token == null) return res.sendStatus(401)

    jwt.verify(token, configData.JWT_SECRET, async (err, user) => {
        if (err) return res.sendStatus(403)
        req.user = user

        const blocked = await MemCacheUtility.Get(req.user.id)
        if (blocked != null) return res.sendStatus(401)

        next()
    })
}

export async function insertBlockedToken(identity: TokenPayload) {
    MemCacheUtility.SetExpiredAt(
        {
            key: identity.id,
            value: identity.id,
            expiredAt: identity.exp
        }
    )
}

export async function removeBlockedToken(id: string) {
    MemCacheUtility.Delete(id)
}