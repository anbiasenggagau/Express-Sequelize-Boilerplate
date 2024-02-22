import { TokenPayload } from "../../middleware/Authentication"
import ErrorHandler from "../../middleware/ErrorHandler"
import ProductsRepo from "../../model/repository/MainRepository/ProductsRepo"
import StoresRepo from "../../model/repository/MainRepository/StoresRepo"
import { paginationType } from "../.BaseRequest"
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

    async handleGetAllProducts(identity: TokenPayload, pagination: paginationType) {
        return await this.Repository.getAndCountData({
            where: {},
            limit: pagination.pageSize,
            offset: (pagination.page - 1) * pagination.pageSize
        })
    }

    async handleUpdateProducts(identity: TokenPayload, body: UpdateAttributeValidation, id: string) {
        const store = await this.StoreRepository.getSingleData({
            where: {
                UserId: identity.id
            }
        })

        if (store == null) throw new ErrorHandler(404, "Store hasn't been created")

        const result = await this.Repository.updateData({
            Name: body.name,
            Price: body.price,
            Currency: body.currency,
            UpdatedBy: identity.id
        },
            {
                where: {
                    Id: id,
                    StoreId: store.Id
                }
            })

        if (result[0] == 0) throw new ErrorHandler(404, "Product not found")

        return true
    }

    async handleDeleteProducts(identity: TokenPayload, id: string) {
        const store = await this.StoreRepository.getSingleData({
            where: {
                UserId: identity.id
            }
        })

        if (store == null) throw new ErrorHandler(404, "Store hasn't been created")

        const result = await this.Repository.deleteData({
            where: {
                Id: id,
                StoreId: store.Id
            }
        })

        if (result == 0) throw new ErrorHandler(404, "Product not found")

        return true
    }
}

export default ProductsHandler