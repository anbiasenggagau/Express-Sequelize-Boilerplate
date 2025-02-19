import { WhereOptions } from "sequelize";
import Store, { StoreAttributes, StoreCreationAttributes } from "../entity/Store";
import BaseRepository from "./.BaseRepository";
import Products from "../entity/Product";

class StoreRepo extends BaseRepository<Store, StoreAttributes, StoreCreationAttributes> {
    async findOrCreate(whereQuery: WhereOptions<StoreAttributes>, valueCreation: StoreCreationAttributes) {
        return await Store.findOrCreate({
            where: { ...whereQuery },
            defaults: { ...valueCreation }
        })
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