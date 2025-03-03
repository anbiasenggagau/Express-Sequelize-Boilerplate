import { Transaction, WhereOptions } from "sequelize";
import Store, { StoreAttributes, StoreCreationAttributes } from "../entity/Store";
import BaseRepository, { LoggingAttribute } from "./.BaseRepository";
import Products from "../entity/Product";

type FindOrCreateOptions = {
    transaction?: Transaction
} & LoggingAttribute

class StoreRepo extends BaseRepository<Store, StoreAttributes, StoreCreationAttributes> {
    async findOrCreate(whereQuery: WhereOptions<StoreAttributes>, valueCreation: StoreCreationAttributes, options?: FindOrCreateOptions) {
        const storeData = await Store.findOne({
            where: { ...whereQuery },
            ...options,
        })
        if (storeData) return storeData

        return await this.insertNewData(valueCreation, options)
    }

    async getProductsFromAllStore() {
        return await Store.findAll({
            where: {},
            include: [
                { model: Products, required: false }
            ]
        })
    }
}

export default new StoreRepo(Store)