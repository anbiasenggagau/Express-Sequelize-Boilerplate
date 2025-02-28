import { Transaction, WhereOptions } from "sequelize";
import Store, { StoreAttributes, StoreCreationAttributes } from "../entity/Store";
import BaseRepository from "./.BaseRepository";
import Products from "../entity/Product";

class StoreRepo extends BaseRepository<Store, StoreAttributes, StoreCreationAttributes> {
    async findOrCreate(whereQuery: WhereOptions<StoreAttributes>, valueCreation: StoreCreationAttributes, transaction?: Transaction) {
        const storeData = await Store.findOne({
            where: { ...whereQuery },
            transaction,
        })
        if (storeData) return storeData

        return await this.insertNewData(valueCreation, { transaction })
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