import express from "express"
import jwt from "jsonwebtoken"
import configData from "../config/GeneralConfig"
import MemCacheUtility from "../utility/MemCacheUtility"

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

        const blocked = await getBlockedToken(req.user)
        if (blocked != null)
            return res.status(403).json({ message: "jwt expired" })

        next()
    })
}

export async function insertBlockedToken(identity: TokenPayload) {
    MemCacheUtility.SetExpiredAt(
        {
            key: identity.id + identity.iat.toString(),
            value: identity.iat.toString(),
            expiredAt: identity.exp
        }
    )
}

export async function removeBlockedToken(identity: TokenPayload) {
    MemCacheUtility.Delete(identity.id + identity.iat.toString())
}

export async function getBlockedToken(identity: TokenPayload) {
    return await MemCacheUtility.Get(identity.id + identity.iat.toString())
}