import UserRepo from "../../model/repository/UserRepo";
import { CreateAttributesBody, UpdateAttributesBody } from "./Request";
import configData from "../../config/GeneralConfig"
import bcrypt from "bcryptjs"
import { TokenPayload } from "../../middleware/Authentication";
import ErrorHandler from "../../middleware/ErrorHandler";
import SessionUtility from "../../utility/SessionUtiliity";

class UserHandler {
    private readonly userRepo = UserRepo

    async handleCreateNewUser(identity: TokenPayload, body: CreateAttributesBody) {
        return await this.userRepo.insertNewData(
            {
                ...body,
                password: bcrypt.hashSync(body.password, configData.ENCRYPTION_SALT),
            },
            { identity }
        )
    }

    async handleUpdateUser(identity: TokenPayload, body: UpdateAttributesBody) {
        body.password = body.password ? bcrypt.hashSync(body.password, configData.ENCRYPTION_SALT) : undefined

        const result = await this.userRepo.updateData(
            { ...body, },
            {
                where: { id: identity.id },
                identity,
            }
        )

        if (result[0] == 0) throw new ErrorHandler(404, "User not found")

        return true
    }

    async handleDeleteUser(identity: TokenPayload) {
        const result = await this.userRepo.deleteData({
            where: { id: identity.id },
            identity,
        })

        if (result == 0) throw new ErrorHandler(404, "User not found or already deleted")
        await SessionUtility.insertBlockedToken(identity)

        return true
    }

    async handleGetSingleUser(identity: TokenPayload) {
        const result = await this.userRepo.getSingleData({
            where: { id: identity.id }
        })
        if (!result) throw new ErrorHandler(404, "Not found")

        return {
            id: result.id,
            email: result.email,
            username: result.username,
            createdAt: result.createdAt
        }
    }
}

export default UserHandler