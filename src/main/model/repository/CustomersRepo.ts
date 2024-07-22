import { WhereOptions } from "sequelize";
import Customers, { CustomersAttributes, CustomersCreationAttributes } from "../entity/Customers";
import BaseRepository from "./.BaseRepository";

class CustomersRepo extends BaseRepository<Customers, CustomersAttributes, CustomersCreationAttributes> {
    async findOrCreate(whereQuery: WhereOptions<CustomersAttributes>, valueCreation: CustomersCreationAttributes) {
        return await Customers.findOrCreate({
            where: { ...whereQuery },
            defaults: { ...valueCreation },
            limit: 1,
        })
    }
}

export default new CustomersRepo(Customers as any)