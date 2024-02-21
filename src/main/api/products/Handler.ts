import { TokenPayload } from "../../middleware/Authentication"
import ErrorHandler from "../../middleware/ErrorHandler"
import ProductsRepo from "../../model/repository/MainRepository/ProductsRepo"
import StoresRepo from "../../model/repository/MainRepository/StoresRepo"
import { CreateAttributeBody, UpdateAttributeValidation } from "./Request"

class ProductsHandler {
    private Repository = ProductsRepo
    private StoreRepository = StoresRepo

    async handleCreateProducts(identity: TokenPayload, body: CreateAttributeBody) {
        const store = await this.StoreRepository.getSingleData({
            where: {
                UserId: identity.id
            }
        })

        if (store == null) throw new ErrorHandler(404, "Store hasn't been created")

        await this.Repository.insertNewData({
            Name: body.name,
            Price: body.price,
            Currency: body.currency,
            StoreId: store.Id,
            CreatedBy: identity.id,
            UpdatedBy: identity.id
        })

        return true
    }

    async handleGetAllProducts(identity: TokenPayload) {
        return await this.Repository.getAllData({
            where: {}
        })
    }

    async handleUpdateProducts(identity: TokenPayload, body: UpdateAttributeValidation, id: string) {
        await this.Repository.updateData({
            Name: body.name,
            Price: body.price,
            Currency: body.currency,
            UpdatedBy: identity.id
        },
            {
                where: {
                    Id: id,
                }
            })

        return true
    }

    async handleDeleteProducts(identity: TokenPayload, id: string) {
        await this.Repository.deleteData({
            where: {
                Id: id
            }
        })

        return true
    }
}

export default ProductsHandler