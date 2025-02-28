import { TokenPayload } from "../../middleware/Authentication"
import ErrorHandler, { TransactionErrorHandler } from "../../middleware/ErrorHandler"
import ProductRepo from "../../model/repository/ProductRepo"
import StoresRepo from "../../model/repository/StoreRepo"
import { CreateAttributeBody, UpdateAttributeValidation, paginationType } from "./Request"

class ProductHandler {
    private readonly productRepo = ProductRepo
    private readonly storeRepository = StoresRepo

    async handleCreateProduct(identity: TokenPayload, body: CreateAttributeBody) {
        const store = await this.storeRepository.getSingleData({
            where: { userId: identity.id }
        })
        if (store == null) throw new ErrorHandler(404, "Store hasn't been created")

        return await this.productRepo.insertNewData(
            {
                ...body,
                storeId: store.id,
            },
            { identity }
        )
    }

    async handleUpdateProduct(identity: TokenPayload, body: UpdateAttributeValidation, id: string) {
        const store = await this.storeRepository.getSingleData({
            where: { userId: identity.id }
        })
        if (store == null) throw new ErrorHandler(404, "Store hasn't been created")

        const result = await this.productRepo.updateData(
            { ...body },
            {
                where: {
                    id: id,
                    storeId: store.id
                },
                identity,
            })

        if (result[0] == 0) throw new ErrorHandler(404, "Product not found")

        return true
    }

    async handleDeleteProduct(identity: TokenPayload, id: string) {
        const transaction = await this.productRepo.startTransaction()
        try {

            const store = await this.storeRepository.getSingleData({
                where: { userId: identity.id }
            })
            if (store == null) throw new ErrorHandler(404, "Store hasn't been created")

            const result = await this.productRepo.deleteData({
                where: {
                    id: id,
                    storeId: store.id
                },
                transaction,
                simmulateForceDelete: true,
                identity,
            })
            if (result == 0) throw new ErrorHandler(404, "Product not found")

            await transaction.commit()
            return true
        } catch (error) {
            await transaction.rollback()
            throw new TransactionErrorHandler(error)
        }
    }

    async handleGetProductsList(identity: TokenPayload, pagination: paginationType) {
        return await this.productRepo.getPaginationData(pagination)
    }
}

export default ProductHandler