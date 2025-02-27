import UsersRepo from "../../model/repository/UserRepo"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { LoginAttributeBody, } from "./Request"
import ErrorHandler from "../../middleware/ErrorHandler"
import configData from "../../config/GeneralConfig"
import { RefreshToken, TokenPayload } from "../../middleware/Authentication"
import SessionUtility from "../../utility/SessionUtiliity"
import { v7 } from "uuid"
import { WhereOptions } from "sequelize"
import { UserAttributes } from "../../model/entity/User"

class AuthHandler {
    private readonly userRepo = UsersRepo

    async handleRefreshToken(identity: RefreshToken) {
        const check = await SessionUtility.checkBeforeRenewAccessToken(identity)
        if (!check.valid) throw new ErrorHandler(401, check.message)

        return await SessionUtility.renewAccessToken(identity)
    }

    async handleLogin(body: LoginAttributeBody): Promise<{ token: string } | { accessToken: string, refreshToken: string }> {
        let whereQuery: WhereOptions<UserAttributes> = {}
        if (body.email) whereQuery.email = body.email
        else whereQuery.username = body.username

        const result = await this.userRepo.getSingleData({
            where: { ...whereQuery }
        })

        if (result == null) throw new ErrorHandler(404, "User Not Found")

        const checkPassword = bcrypt.compareSync(body.password, result.password)
        if (!checkPassword) throw new ErrorHandler(400, "Wrong password")

        const accessTokenObject = {
            id: result.id,
            username: result.username
        }
        const accessToken = jwt.sign(accessTokenObject, configData.JWT_SECRET, { expiresIn: configData.JWT_EXPIRATION })

        if (configData.REFRESH_TOKEN) {
            const refreshTokenObject = {
                id: result.id,
                username: result.username,
                refresh: true,
                refreshId: v7()
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