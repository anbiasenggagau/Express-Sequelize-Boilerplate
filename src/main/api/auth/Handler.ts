import UsersRepo from "../../model/repository/MainRepository/UsersRepo"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { LoginAttributeBody, } from "./Request"
import ErrorHandler from "../../middleware/ErrorHandler"
import configData from "../../config/GeneralConfig"
import { RefreshToken, TokenPayload } from "../../middleware/Authentication"
import SessionUtility from "../../utility/SessionUtiliity"
import uuid from "uuid"

class AuthHandler {
    private userRepo = UsersRepo

    async handleRefreshToken(identity: RefreshToken) {
        const check = await SessionUtility.checkBeforeRenewAccessToken(identity)
        if (!check.valid) throw new ErrorHandler(401, check.message)

        return await SessionUtility.renewAccessToken(identity)
    }

    async handleLogin(body: LoginAttributeBody): Promise<{ token: string } | { accessToken: string, refreshToken: string }> {
        let whereQuery: any = {}
        if (body.email) whereQuery.Email = body.email
        else whereQuery.Username = body.username

        const result = await this.userRepo.getSingleData({
            where: { ...whereQuery }
        })

        if (result == null) throw new ErrorHandler(404, "User Not Found")

        const checkPassword = bcrypt.compareSync(body.password, result.Password)
        if (!checkPassword) throw new ErrorHandler(400, "Wrong password")

        const accessTokenObject = {
            id: result.Id,
            username: result.Username
        }
        const accessToken = jwt.sign(accessTokenObject, configData.JWT_SECRET, { expiresIn: configData.JWT_EXPIRATION })

        if (configData.REFRESH_TOKEN) {
            const refreshTokenObject = {
                id: result.id,
                username: result.Username,
                refreshId: uuid.v7()
            }
            const refreshToken = jwt.sign(refreshTokenObject, configData.JWT_SECRET, { expiresIn: configData.JWT_REFRESH_EXPIRATION })

            SessionUtility.insertRefreshLoginToken(refreshToken, accessToken)

            return { accessToken, refreshToken }
        }
        else SessionUtility.insertLoginToken(accessToken)

        return { token: accessToken }
    }

    async handleLogout(identity: TokenPayload | RefreshToken) {
        if (configData.REFRESH_TOKEN) await SessionUtility.revokeSession(identity as RefreshToken)
        else await SessionUtility.insertBlockedToken(identity)

        return true
    }
}

export default AuthHandler