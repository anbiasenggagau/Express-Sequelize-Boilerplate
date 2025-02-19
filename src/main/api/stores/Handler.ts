import { TokenPayload } from "../../middleware/Authentication"
import ErrorHandler from "../../middleware/ErrorHandler"
import StoreRepo from "../../model/repository/StoreRepo"
import { CreateAttributeBody, UpdateAttributeValidation } from "./Request"

class StoreHandler {
    private readonly storeRepo = StoreRepo

    async handleCreateStore(identity: TokenPayload, body: CreateAttributeBody) {
        const result = await this.storeRepo.findOrCreate(
            { userId: identity.id },
            {
                ...body,
                userId: identity.id,
            }
        )

        if (!result[1]) throw new ErrorHandler(400, "You already create your own store")

        return result[0]
    }

    async handleUpdateStore(identity: TokenPayload, body: UpdateAttributeValidation) {
        const result = await this.storeRepo.updateData(
            { ...body, },
            {
                where: { userId: identity.id },
                identity,
            }
        )

        if (result[0] == 0) throw new ErrorHandler(404, "Your store not found")

        return true
    }

    async handleGetAllProducts(identity: TokenPayload) {
        return await this.storeRepo.getProductsFromAllStore()
    }
}

export default StoreHandler