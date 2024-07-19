import jwt from "jsonwebtoken"
import configData from "../config/GeneralConfig"
import { RefreshToken, TokenPayload } from "../middleware/Authentication"
import MemCacheUtility from "./MemCacheUtility"
import uuid from "uuid"

type RefreshTokenSession = {
    refreshId: string
    exp: number
}

class SessionUtility {
    static async insertRefreshLoginToken(refreshToken: string, accessToken: string) {
        const refreshTokenObject = jwt.verify(refreshToken, configData.JWT_SECRET)
        const accessTokenObject = jwt.verify(accessToken, configData.JWT_SECRET)

        let tokenNumber: number[] = []
        const identity = refreshTokenObject as RefreshToken

        // Only allow certain amount of sessions
        const keys = await MemCacheUtility.GetKeysFromPattern("login" + identity.id + "=>*")
        if (keys) {
            tokenNumber = keys.map(value => parseInt(value.split("=>")[1]))

            if (keys.length >= configData.NUMBER_OF_ALLOWED_SESSIONS) {
                const min = Math.min(...tokenNumber)
                const key = keys.find(value => value.includes("login" + identity.id + "=>" + min))!
                const lastTokenSession = await MemCacheUtility.Get(key) as string
                const lastTokenSessionObject = JSON.parse(lastTokenSession) as RefreshTokenSession

                MemCacheUtility.Delete(key)
                MemCacheUtility.Delete(lastTokenSessionObject.refreshId)
            }

            let max = 0
            if (tokenNumber.length > 0) max = Math.max(...tokenNumber)

            MemCacheUtility.SetExpiredAt({
                key: "login" + identity.id + "=>" + (max + 1),
                value: JSON.stringify(
                    {
                        refreshId: identity.refreshId,
                        exp: identity.exp
                    } as RefreshTokenSession
                ),
                expiredAt: identity.exp
            })

            MemCacheUtility.SetExpiredAt({
                key: "valid" + identity.refreshId,
                value: JSON.stringify(accessTokenObject),
                expiredAt: identity.exp
            })
        }
    }

    static async renewAccessToken(refreshTokenObject: RefreshToken) {
        const newRefreshTokenObject = {
            id: refreshTokenObject.id,
            username: refreshTokenObject.username,
            refresh: refreshTokenObject.refresh,
            refreshId: uuid.v7(),
        }

        const newAccessTokenObject = {
            id: refreshTokenObject.id,
            username: refreshTokenObject.username,
        }

        const accessToken = jwt.sign(newAccessTokenObject, configData.JWT_SECRET, { expiresIn: configData.JWT_EXPIRATION })
        const refreshToken = jwt.sign(newRefreshTokenObject, configData.JWT_SECRET, { expiresIn: configData.JWT_REFRESH_EXPIRATION })

        const newRefreshTokenObjectWithExp = jwt.verify(refreshToken, configData.JWT_SECRET) as RefreshToken

        const currentSessionKey = (await MemCacheUtility.GetKeysFromPattern("login" + refreshTokenObject.id + "=>*=>" + refreshTokenObject.refreshId) as string[])[0]
        const sessionNumber = currentSessionKey.split("=>")[1]

        MemCacheUtility.SetExpiredAt({
            key: "blocked" + refreshTokenObject.refreshId,
            value: "X",
            expiredAt: refreshTokenObject.exp,
        })
        MemCacheUtility.SetExpiredAt({
            key: "valid" + newRefreshTokenObject.refreshId,
            value: JSON.stringify(newAccessTokenObject),
            expiredAt: newRefreshTokenObjectWithExp.exp
        })
        MemCacheUtility.SetExpiredAt({
            key: "login" + newRefreshTokenObjectWithExp.id + "=>" + sessionNumber + "=>" + newRefreshTokenObjectWithExp.refreshId,
            value: JSON.stringify(
                {
                    refreshId: newRefreshTokenObjectWithExp.refreshId,
                    exp: newRefreshTokenObjectWithExp.exp
                } as RefreshTokenSession
            ),
            expiredAt: newRefreshTokenObjectWithExp.exp
        })
        MemCacheUtility.Delete("valid" + refreshTokenObject.refreshId)
        MemCacheUtility.Delete(currentSessionKey)

        return { accessToken, refreshToken }
    }

    static async checkBeforeRenewAccessToken(refreshTokenObject: RefreshToken): Promise<{ valid: boolean, message: string }> {
        let check = await MemCacheUtility.Get("valid" + refreshTokenObject.refreshId)
        if (!check) {
            check = await MemCacheUtility.Get("blocked" + refreshTokenObject.refreshId)
            if (!check) return { valid: false, message: "jwt expired" }

            this.revokeAllSession(refreshTokenObject)
            return { valid: false, message: "Your session token has been hijacked by someone else" }
        }

        const sessionObject = JSON.parse(check) as TokenPayload
        if (sessionObject.exp < (new Date()).getTime()) {
            this.revokeAllSession(refreshTokenObject)
            return { valid: false, message: "Your session token has been hijacked by someone else" }
        }
        return { valid: true, message: "" }
    }

    private static async revokeAllSession(refreshTokenObject: RefreshToken) {
        const allSessionKey = await MemCacheUtility.GetKeysFromPattern("login" + refreshTokenObject.id + "*") as string[]
        for (const sessionKey in allSessionKey) {
            const session = await MemCacheUtility.Get(sessionKey) as string
            const sessionObject = JSON.parse(session) as RefreshTokenSession

            MemCacheUtility.Delete(sessionKey)
            MemCacheUtility.Delete("valid" + sessionObject.refreshId)
        }
    }

    static async revokeSession(refreshTokenObject: RefreshToken) {
        const currentSessionKey = (await MemCacheUtility.GetKeysFromPattern("login" + refreshTokenObject.id + "=>*=>" + refreshTokenObject.refreshId) as string[])[0]
        MemCacheUtility.Delete(currentSessionKey)
        MemCacheUtility.Delete("valid" + refreshTokenObject.refreshId)
    }

    static async insertLoginToken(token: string) {
        jwt.verify(token, configData.JWT_SECRET, async (err, user) => {
            let tokenNumber: number[] = []
            const identity = user as TokenPayload

            // Only allow certain sessions
            const keys = await MemCacheUtility.GetKeysFromPattern("login" + identity.id + "=>*")
            if (keys) {
                tokenNumber = keys.map(value => parseInt(value.split("=>")[1]))

                if (keys.length >= configData.NUMBER_OF_ALLOWED_SESSIONS) {
                    const min = Math.min(...tokenNumber)
                    const key = keys.find(value => value.includes("login" + identity.id + "=>" + min))!
                    const loginToken = await MemCacheUtility.Get(key)

                    if (!loginToken) return null
                    const loginTokenObject = JSON.parse(loginToken) as TokenPayload
                    this.insertBlockedToken(loginTokenObject)
                }

                let max = 0
                if (tokenNumber.length > 0) max = Math.max(...tokenNumber)

                MemCacheUtility.SetExpiredAt({
                    key: "login" + identity.id + "=>" + (max + 1) + "=>" + identity.iat,
                    value: JSON.stringify(identity),
                    expiredAt: identity.exp
                })
            }
        })
    }

    static async insertBlockedToken(identity: TokenPayload) {
        const keys = await MemCacheUtility.GetKeysFromPattern("login" + identity.id + "=>*=>" + identity.iat)
        if (keys) MemCacheUtility.Delete(keys[0])

        MemCacheUtility.SetExpiredAt(
            {
                key: identity.id + identity.iat.toString(),
                value: JSON.stringify(identity),
                expiredAt: identity.exp
            }
        )
    }

    static async removeBlockedToken(identity: TokenPayload) {
        MemCacheUtility.Delete(identity.id + identity.iat.toString())
    }

    static async getBlockedToken(identity: TokenPayload) {
        return await MemCacheUtility.Get(identity.id + identity.iat.toString())
    }
}

export default SessionUtility