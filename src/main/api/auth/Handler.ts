import UsersRepo from "../../model/repository/UserRepo"
import bcrypt from "bcryptjs"
import { LoginAttributeBody, } from "./Request"
import ErrorHandler from "../../middleware/ErrorHandler"
import configData from "../../config/GeneralConfig"
import SessionUtility from "../../utility/SessionUtiliity"
import { v4 } from "uuid"
import { WhereOptions } from "sequelize"
import { UserAttributes } from "../../model/entity/User"
import { TokenPayload } from "../../middleware/Authentication"

class AuthHandler {
    private readonly userRepo = UsersRepo

    async handleRefreshToken(refreshToken: string) {
        const check = await SessionUtility.checkBlockedRefreshToken(refreshToken)
        if (!check.valid) throw new ErrorHandler(401, check.message)

        return await SessionUtility.renewAccessToken(refreshToken)
    }

    async handleLogin(body: LoginAttributeBody): Promise<{ accessToken: string } | { accessToken: string, refreshToken: string }> {
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
            username: result.username,
        }
        const accessToken = SessionUtility.generateAccessToken(accessTokenObject)

        if (configData.REFRESH_TOKEN) {
            const refreshToken = v4()
            SessionUtility.insertRefreshLoginToken(refreshToken, accessTokenObject)
            return { accessToken, refreshToken }
        }
        else SessionUtility.insertLoginToken(accessToken)
        return { accessToken }
    }

    async handleLogout(refreshTokenOrIdentity: string | TokenPayload) {
        if (typeof refreshTokenOrIdentity == "string") await SessionUtility.revokeSession(refreshTokenOrIdentity)
        else await SessionUtility.blockToken(refreshTokenOrIdentity)
        return true
    }
}

export default AuthHandler