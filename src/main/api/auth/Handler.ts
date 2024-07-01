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
        const tokenObject = {
            id: identity.id,
            username: identity.username
        }

        const refreshTokenObject = {
            id: identity.id,
            username: identity.username,
            refresh: true
        }

        const token = jwt.sign(tokenObject, configData.JWT_SECRET, { expiresIn: configData.JWT_EXPIRATION })
        const refreshToken = jwt.sign(refreshTokenObject, configData.JWT_SECRET, { expiresIn: configData.JWT_REFRESH_EXPIRATION })
    }

    async handleLogin(body: LoginAttributeBody) {
        let whereQuery: any = {}
        if (body.email) whereQuery.Email = body.email
        else whereQuery.Username = body.username

        const result = await this.userRepo.getSingleData({
            where: { ...whereQuery }
        })

        if (result == null) throw new ErrorHandler(404, "User Not Found")

        const checkPassword = bcrypt.compareSync(body.password, result.Password)
        if (!checkPassword) throw new ErrorHandler(400, "Wrong password")

        const tokenObject = {
            id: result.Id,
            username: result.Username
        }
        const token = jwt.sign(tokenObject, configData.JWT_SECRET, { expiresIn: configData.JWT_EXPIRATION })

        const refreshTokenObject = {
            id: result.id,
            username: result.Username,
            refreshId: uuid.v7()
        }
        const refreshToken = jwt.sign(refreshTokenObject, configData.JWT_SECRET, { expiresIn: configData.JWT_REFRESH_EXPIRATION })

        SessionUtility.insertLoginToken(token, refreshToken)

        return token
    }

    async handleLogout(identity: TokenPayload) {
        await SessionUtility.insertBlockedToken(identity)

        return true
    }
}

export default AuthHandler