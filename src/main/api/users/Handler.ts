import UsersRepo from "../../model/repository/UsersRepo";
import { CreateAttributesBody, UpdateAttributesBody } from "./Request";
import configData from "../../config/GeneralConfig"
import bcrypt from "bcryptjs"
import { TokenPayload } from "../../middleware/Authentication";

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
        await this.Repository.updateData(
            {
                Email: body.email,
                Password: bcrypt.hashSync(body.password!, configData.ENCRYPTION_SALT),
                Username: body.username
            },
            {
                where: {
                    Id: identity.id
                }
            }
        )

        return true
    }

    async handleDeleteUser(identity: TokenPayload) {
        await this.Repository.deleteData({
            where: {
                Id: identity.id
            }
        })

        return true
    }

    async handleGetSingleUser(identity: TokenPayload) {
        return await this.Repository.getSingleData({
            where: {
                Id: identity.id
            }
        })
    }
}

export default UsersHandler