import jwt from "jsonwebtoken"
import configData from "../config/GeneralConfig"
import { TokenPayload } from "../middleware/Authentication"
import MemCacheUtility from "./MemCacheUtility"

class SessionUtility {
    static async insertLoginToken(token: string) {
        jwt.verify(token, configData.JWT_SECRET, async (err, user) => {
            let tokenNumber: number[] = []
            const identity = user as TokenPayload

            // Only allow certain sessions
            const keys = await MemCacheUtility.GetKeysFromPattern("login" + identity.id + "=>")
            if (keys) {
                tokenNumber = keys.map(value => parseInt(value.split("=>")[1]))

                if (keys.length >= configData.NUMBER_OF_ALLOWED_SESSIONS) {
                    const min = Math.min(...tokenNumber)
                    const loginToken = await MemCacheUtility.Get("login" + identity.id + "=>" + min)

                    if (!loginToken) return null
                    const loginTokenObject = JSON.parse(loginToken) as TokenPayload
                    this.insertBlockedToken(loginTokenObject)
                    MemCacheUtility.Delete("login" + identity.id + "=>" + min)
                }

                let max = 0
                if (tokenNumber.length > 0) max = tokenNumber[tokenNumber.length - 1]

                MemCacheUtility.SetExpiredAt({
                    key: "login" + identity.id + "=>" + (max + 1),
                    value: JSON.stringify(identity),
                    expiredAt: identity.exp
                })
            }
        })
    }

    static async insertBlockedToken(identity: TokenPayload) {
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