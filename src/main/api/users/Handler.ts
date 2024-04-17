import UsersRepo from "../../model/repository/MainRepository/UsersRepo";
import { CreateAttributesBody, UpdateAttributesBody } from "./Request";
import configData from "../../config/GeneralConfig"
import bcrypt from "bcryptjs"
import { TokenPayload } from "../../middleware/Authentication";
import ErrorHandler from "../../middleware/ErrorHandler";
import SessionUtility from "../../utility/SessionUtiliity";

class UsersHandler {
    private Repository = UsersRepo

    async handleCreateNewUser(body: CreateAttributesBody) {
        await this.Repository.insertNewData({
            Email: body.email,
            Password: bcrypt.hashSync(body.password, configData.ENCRYPTION_SALT),
            Username: body.username
        })

        return true
    }

    async handleUpdateUser(identity: TokenPayload, body: UpdateAttributesBody) {
        const password = body.password ? bcrypt.hashSync(body.password, configData.ENCRYPTION_SALT) : undefined

        const result = await this.Repository.updateData(
            {
                Email: body.email,
                Password: password,
                Username: body.username
            },
            {
                where: {
                    Id: identity.id
                }
            }
        )

        if (result[0] == 0) throw new ErrorHandler(404, "User not found")

        return true
    }

    async handleDeleteUser(identity: TokenPayload) {
        const result = await this.Repository.deleteData({
            where: {
                Id: identity.id
            }
        })

        if (result == 0) throw new ErrorHandler(404, "User not found or already deleted")
        await SessionUtility.insertBlockedToken(identity)

        return true
    }

    async handleGetSingleUser(identity: TokenPayload) {
        const result = await this.Repository.getSingleData({
            where: {
                Id: identity.id
            }
        })

        return {
            id: result?.Id,
            email: result?.Email,
            username: result?.Username,
            createdAt: result?.CreatedAt
        }
    }
}

export default UsersHandler