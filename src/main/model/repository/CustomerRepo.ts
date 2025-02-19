import { WhereOptions } from "sequelize";
import Customer, { CustomerAttributes, CustomerCreationAttributes } from "../entity/Customer";
import BaseRepository from "./.BaseRepository";

class CustomerRepo extends BaseRepository<Customer, CustomerAttributes, CustomerCreationAttributes> {
    async findOrCreate(whereQuery: WhereOptions<CustomerAttributes>, valueCreation: CustomerCreationAttributes) {
        return await Customer.findOrCreate({
            where: { ...whereQuery },
            defaults: { ...valueCreation },
            limit: 1,
        })
    }
}

export default new CustomerRepo(Customer)