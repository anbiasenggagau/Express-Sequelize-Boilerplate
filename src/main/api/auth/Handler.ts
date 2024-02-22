import UsersRepo from "../../model/repository/MainRepository/UsersRepo"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { LoginAttributeBody } from "./Request"
import ErrorHandler from "../../middleware/ErrorHandler"
import configData from "../../config/GeneralConfig"
import { TokenPayload, insertBlockedToken } from "../../middleware/Authentication"

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

        return jwt.sign({ id: result.Id, username: result.Username }, configData.JWT_SECRET, { expiresIn: "30m" })
    }

    async handleLogout(identity: TokenPayload) {
        await insertBlockedToken(identity)

        return true
    }
}

export default AuthHandler