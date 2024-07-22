import { TokenPayload } from "../../middleware/Authentication"
import ErrorHandler from "../../middleware/ErrorHandler"
import StoresRepo from "../../model/repository/StoresRepo"
import { CreateAttributeBody, UpdateAttributeValidation } from "./Request"

class StoresHandler {
    private Repository = StoresRepo

    async handleCreateStores(identity: TokenPayload, body: CreateAttributeBody) {
        const result = await this.Repository.findOrCreate(
            {
                UserId: identity.id
            },
            {
                UserId: identity.id,
                Name: body.name
            }
        )

        if (!result[1]) throw new ErrorHandler(400, "You already create your own store")

        return result[0]
    }

    async handleUpdateStores(identity: TokenPayload, body: UpdateAttributeValidation) {
        const result = await this.Repository.updateData(
            {
                Name: body.name
            },
            {
                where: {
                    UserId: identity.id
                }
            }
        )

        if (result[0] == 0) throw new ErrorHandler(404, "Your store not found")

        return true
    }

    async handleGetAllProducts(identity: TokenPayload) {
        return await this.Repository.getProductsFromAllStores()
    }
}

export default StoresHandler