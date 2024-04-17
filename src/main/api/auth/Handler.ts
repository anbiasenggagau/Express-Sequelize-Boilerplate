import UsersRepo from "../../model/repository/MainRepository/UsersRepo"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { LoginAttributeBody } from "./Request"
import ErrorHandler from "../../middleware/ErrorHandler"
import configData from "../../config/GeneralConfig"
import { TokenPayload } from "../../middleware/Authentication"
import SessionUtility from "../../utility/SessionUtiliity"

class AuthHandler {
    private userRepo = UsersRepo

    async handleLogin(body: LoginAttributeBody) {
        let whereQuery: any = {}
        if (body.email) whereQuery.Email = body.email
        else whereQuery.Username = body.username

        console.log(whereQuery)

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
        SessionUtility.insertLoginToken(token)

        return token
    }

    async handleLogout(identity: TokenPayload) {
        await SessionUtility.insertBlockedToken(identity)

        return true
    }
}

export default AuthHandler