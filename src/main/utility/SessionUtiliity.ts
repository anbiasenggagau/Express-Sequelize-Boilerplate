import jwt from "jsonwebtoken"
import configData from "../config/GeneralConfig"
import { TokenPayload } from "../middleware/Authentication"
import RedisUtility from "./RedisUtility"
import { v4 } from "uuid"
import ErrorHandler from "../middleware/ErrorHandler"

class SessionUtility {
    static generateAccessToken(tokenPayload: Omit<TokenPayload, "exp" | "iat">) {
        const accessToken = jwt.sign(tokenPayload, configData.JWT_SECRET, { expiresIn: configData.JWT_EXPIRATION })
        return accessToken
    }

    // ==================================================================================
    // Cache key will follow this pattern if we are using Refresh Token Mechanism
    // login=>identity.id=>session_number=>refresh_id
    // blocked=>refresh_id

    static async insertRefreshLoginToken(refreshToken: string, tokenPayload: Omit<TokenPayload, "exp" | "iat">) {
        let tokenNumber: number[] = []

        // Only allow certain amount of sessions
        const keys = await RedisUtility.GetKeysFromPattern("login=>" + tokenPayload.id + "=>*")
        if (keys) {
            tokenNumber = keys.map(value => parseInt(value.split("=>")[2]))

            // Terminate oldest session
            if (keys.length >= configData.NUMBER_OF_ALLOWED_SESSIONS) {
                const min = Math.min(...tokenNumber)
                const lastTokenSessionKey = keys.find(value => value.includes("login=>" + tokenPayload.id + "=>" + min))!

                RedisUtility.Delete(lastTokenSessionKey)
            }

            let max = 0
            if (tokenNumber.length > 0) max = Math.max(...tokenNumber)

            if (configData.JWT_REFRESH_EXPIRATION != 0)
                RedisUtility.SetEx({
                    key: "login=>" + tokenPayload.id + "=>" + (max + 1) + "=>" + (refreshToken),
                    value: JSON.stringify(tokenPayload),
                    ttl: configData.JWT_REFRESH_EXPIRATION
                })
            else
                RedisUtility.Set({
                    key: "login=>" + tokenPayload.id + "=>" + (max + 1) + "=>" + (refreshToken),
                    value: JSON.stringify(tokenPayload),
                })
        }
    }

    static async renewAccessToken(refreshToken: string) {
        // Generate new access token and rolling the given refresh token
        const keys = await RedisUtility.GetKeysFromPattern("login=>*" + refreshToken)
        if (keys && keys.length > 0) {
            const key = keys[0]
            const currentSession = JSON.parse(await RedisUtility.Get(key) as string)
            const newAccessToken = jwt.sign(currentSession, configData.JWT_SECRET, { expiresIn: configData.JWT_EXPIRATION })
            const newRefreshToken = v4()
            const newKeySession = key.split("=>")
            newKeySession[3] = newRefreshToken

            // If Refresh Token is 0
            // It means that the refresh token will never expire
            if (configData.JWT_REFRESH_EXPIRATION != 0)
                RedisUtility.SetEx({
                    key: newKeySession.join("=>"),
                    value: JSON.stringify(currentSession),
                    ttl: configData.JWT_REFRESH_EXPIRATION,
                })
            else
                RedisUtility.Set({
                    key: newKeySession.join("=>"),
                    value: JSON.stringify(currentSession),
                })

            const remainingTTL = (await RedisUtility.TTL(key)) ?? 14400
            RedisUtility.Delete(key)
            RedisUtility.SetEx({
                key: "blocked=>" + refreshToken,
                value: currentSession.id,
                ttl: remainingTTL
            })

            return { accessToken: newAccessToken, refreshToken: newRefreshToken }
        }
        // If valid refresh token is not found, then it will return Status Code 401
        throw new ErrorHandler(401)
    }

    static async checkBlockedRefreshToken(refreshToken: string): Promise<{ valid: boolean, message: string }> {
        // Check if user is using the blocked refresh token
        // If so, then it is guarentee that refresh token is hijacked
        try {
            const value = await RedisUtility.Get("blocked=>" + refreshToken)
            if (value) {
                this.revokeAllSession(value)
                return { valid: false, message: "Your session token has been hijacked by someone else" }
            }
            return { valid: true, message: "" }
        } catch (error) {
            throw new ErrorHandler(500)
        }
    }

    static async revokeAllSession(tokenObject: TokenPayload | string) {
        if (typeof tokenObject == "string")
            RedisUtility.DeleteKeysFromPattern("login=>" + tokenObject + "=>*")
        else
            RedisUtility.DeleteKeysFromPattern("login=>" + tokenObject.id + "=>*")
    }

    static async revokeSession(refreshToken: string) {
        const currentSessionKey = (await RedisUtility.GetKeysFromPattern("login=>*" + refreshToken) as string[])[0]
        const remainingTTL = (await RedisUtility.TTL(currentSessionKey)) ?? 14400
        RedisUtility.Delete(currentSessionKey)
        RedisUtility.SetEx({
            key: "blocked=>" + refreshToken,
            value: currentSessionKey.split("=>")[1],
            ttl: remainingTTL
        })
    }

    // ==================================================================================
    // Cache key will follow this pattern
    // login=>identity.id=>session_number=>identity.iat
    // blocked=>identity.id=>identity.iat

    static async insertLoginToken(tokenString: string) {
        const tokenObject = jwt.verify(tokenString, configData.JWT_SECRET) as TokenPayload
        let tokenNumber: number[] = []

        // Only allow certain sessions
        const keys = await RedisUtility.GetKeysFromPattern("login=>" + tokenObject.id + "=>*")
        if (keys) {
            tokenNumber = keys.map(value => parseInt(value.split("=>")[2]))

            if (keys.length >= configData.NUMBER_OF_ALLOWED_SESSIONS) {
                const min = Math.min(...tokenNumber)
                const lastTokenSessionKey = keys.find(value => value.includes("login=>" + tokenObject.id + "=>" + min))!

                // Insert last session as blocked token
                const lastSessionTokenObject = JSON.parse(await RedisUtility.Get(lastTokenSessionKey) as string) as TokenPayload
                RedisUtility.Delete(lastTokenSessionKey)
                RedisUtility.SetExpiredAt(
                    {
                        key: "blocked=>" + lastSessionTokenObject.id + "=>" + lastSessionTokenObject.iat.toString(),
                        value: JSON.stringify(lastSessionTokenObject),
                        expiredAt: lastSessionTokenObject.exp
                    }
                )
            }

            let max = 0
            if (tokenNumber.length > 0) max = Math.max(...tokenNumber)

            RedisUtility.SetExpiredAt({
                key: "login=>" + tokenObject.id + "=>" + (max + 1) + "=>" + tokenObject.iat.toString(),
                value: JSON.stringify(tokenObject),
                expiredAt: tokenObject.exp
            })
        }
    }

    static async blockAllToken(tokenObject: TokenPayload) {
        RedisUtility.DeleteKeysFromPattern("login=>" + tokenObject.id + "=>*")
        RedisUtility.SetExpiredAt(
            {
                key: "blocked=>" + tokenObject.id + "=>" + tokenObject.iat.toString(),
                value: JSON.stringify(tokenObject),
                expiredAt: tokenObject.exp
            }
        )
    }

    static async blockToken(tokenObject: TokenPayload) {
        RedisUtility.DeleteKeysFromPattern("login=>" + tokenObject.id + "=>*" + tokenObject.iat.toString())
        RedisUtility.SetExpiredAt(
            {
                key: "blocked=>" + tokenObject.id + "=>" + tokenObject.iat.toString(),
                value: JSON.stringify(tokenObject),
                expiredAt: tokenObject.exp
            }
        )
    }

    static async getBlockedToken(tokenObject: TokenPayload) {
        return await RedisUtility.Get("blocked=>" + tokenObject.id + "=>" + tokenObject.iat.toString())
    }
}

export default SessionUtility