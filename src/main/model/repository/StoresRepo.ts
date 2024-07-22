import { WhereOptions } from "sequelize";
import Stores, { StoresAttributes, StoresCreationAttributes } from "../entity/Stores";
import BaseRepository from "./.BaseRepository";
import Products from "../entity/Products";

class StoresRepo extends BaseRepository<Stores, StoresAttributes, StoresCreationAttributes> {
    async findOrCreate(whereQuery: WhereOptions<StoresAttributes>, valueCreation: StoresCreationAttributes) {
        return await Stores.findOrCreate({
            where: { ...whereQuery },
            defaults: { ...valueCreation }
        })
    }

    async getProductsFromAllStores() {
        return await Stores.findAll({
            where: {},
            include: [
                { model: Products, required: false }
            ]
        })
    }
}

export default new StoresRepo(Stores as any)